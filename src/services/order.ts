import { Order, OrderItem } from '../interfaces/order.interface'
import supabase from '../config/supabase'
import { redis } from '../config/redis'
import moment from 'moment-timezone'

type Meal = { id: number; price: number }

const getLastOrderNumber = async (): Promise<number> => {
  const now = moment().tz('America/Monterrey')
  const startOfDay = now
    .clone()
    .set({ hour: 3, minute: 0, second: 0, millisecond: 0 })
  const endOfDay = startOfDay.clone().add(1, 'day')

  const startOfDayISO = startOfDay.toISOString()
  const endOfDayISO = endOfDay.toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .gte('created_at', startOfDayISO)
    .lt('created_at', endOfDayISO)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<Order>()

  if (error || !data) {
    return 1
  }

  return data.order_number + 1
}

const insertNewOrder = async ({
  orderNumber,
  clientName,
  clientPhone
}: {
  orderNumber: number
  clientName: string
  clientPhone: string
}): Promise<number> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        order_number: orderNumber,
        order_status: 'En proceso',
        client_name: clientName,
        client_phone: clientPhone,
        total_price: 0
      }
    ])
    .select('id')
    .single<Order>()

  if (error || !data) {
    throw new Error('ORDER_INSERT_ERROR')
  }

  return data.id
}

const insertOrderItems = async (
  items: OrderItem[],
  orderId: number
): Promise<{
  totalPrice: number
  subtotals: { meal_id: number; subtotal: number }[]
}> => {
  // Fetch all meal prices in one query
  const mealIds = items.map((item) => item.meal_id)
  const { data: meals, error: mealError } = await supabase
    .from('meals')
    .select('id, price')
    .in('id', mealIds)

  if (mealError || !meals) {
    throw new Error('MEAL_FETCH_ERROR')
  }

  const typedMeals = meals as unknown as Meal[]

  // Map meal prices
  const mealPrices = new Map(typedMeals.map((meal) => [meal.id, meal.price]))
  let totalPrice = 0
  const orderItems = []
  const itemDetails = []
  const subtotals = []

  for (const item of items) {
    const price = mealPrices.get(item.meal_id)
    if (price === undefined) {
      throw new Error(`Invalid meal ID: ${item.meal_id}`)
    }

    const subtotal = price * item.quantity
    totalPrice += subtotal
    subtotals.push({ meal_id: item.meal_id, subtotal })

    // Prepare order items and details for batch insert
    orderItems.push({
      order_id: orderId,
      meal_id: item.meal_id,
      quantity: item.quantity,
      subtotal
    })

    if (item.details && item.details.length > 0) {
      itemDetails.push(
        ...item.details.map((detail) => ({
          details: detail
        }))
      )
    }
  }

  // Batch insert order items
  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (orderItemsError) {
    throw new Error('ORDER_ITEMS_INSERT_ERROR')
  }

  // Batch insert order item details
  if (itemDetails.length > 0) {
    const { error: detailsError } = await supabase
      .from('order_item_details')
      .insert(itemDetails)

    if (detailsError) {
      throw new Error('ORDER_ITEM_DETAILS_INSERT_ERROR')
    }
  }

  return { totalPrice, subtotals }
}

const updateOrderTotal = async (
  orderId: number,
  totalPrice: number
): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ total_price: totalPrice })
    .eq('id', orderId)

  if (error) {
    throw new Error('ORDER_TOTAL_UPDATE_ERROR')
  }
}

const handlePayments = async (
  payments: { payment_method: string; amount_given: number }[],
  orderId: number,
  totalPrice: number
): Promise<number> => {
  if (!payments || payments.length === 0) {
    return 0 // No payments provided
  }

  const { error } = await supabase.from('payments').insert(
    payments.map((payment) => ({
      payment_method: payment.payment_method,
      amount_given: payment.amount_given,
      order_id: orderId
    }))
  )

  if (error) {
    throw new Error('PAYMENTS_INSERT_ERROR')
  }

  const totalGiven = payments.reduce(
    (sum, payment) => sum + payment.amount_given,
    0
  )

  return totalGiven - totalPrice // Return exchange
}

const storeOrderInRedis = async (order: any) => {
  try {
    const currentData = await redis.get('orders')
    const orders = currentData ? JSON.parse(currentData) : []

    orders.push(order)

    await redis.set('orders', JSON.stringify(orders))
  } catch (error) {
    console.error('Error storing order in Redis:', error)
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const insertOrder = async (order: Order) => {
  try {
    const orderNumber = await getLastOrderNumber()
    const orderId = await insertNewOrder({
      orderNumber,
      clientName: order.client_name,
      clientPhone: order.client_phone
    })

    // Parallelizing the fetching of meal prices and inserting order items
    const [orderItemsResult] = await Promise.all([
      insertOrderItems(order.items, orderId)
    ])

    await updateOrderTotal(orderId, orderItemsResult.totalPrice)

    // Parallelizing the payment handling and order storage in Redis
    const [exchange] = await Promise.all([
      handlePayments(order.payments, orderId, orderItemsResult.totalPrice),
      storeOrderInRedis({ orderId, ...order })
    ])

    return {
      message: 'Order saved successfully',
      exchange,
      totalPrice: orderItemsResult.totalPrice,
      subtotals: orderItemsResult.subtotals
    }
  } catch (error) {
    console.error('Error inserting order:', error)
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getOrders = async (): Promise<Order[]> => {
  try {
    // Step 1: Check Redis cache for data
    const cachedOrders = await redis.get('orders')
    if (cachedOrders) {
      console.log('Returning orders from cache')
      return JSON.parse(cachedOrders)
    }

    console.log('Cache miss: Fetching orders from database')
    // Step 1: Query the 'orders' table and related 'order_items' and 'payments'
    const { data, error } = await supabase.from('orders').select(`
        id,
        order_number,
        order_status,
        client_name,
        client_phone,
        total_price,
        created_at,
        items:order_items(meal_id, quantity, subtotal, order_id, id),
        payments(payment_method, amount_given, order_id)
      `)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('FAILED_TO_FETCH_ORDERS')
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('NO_ORDER_FOUND')
    }

    // Step 2: Fetch 'order_item_details' for each 'order_item' (one-to-many relationship)
    const ordersWithDetails = await Promise.all(
      data.map(async (order: any) => {
        // Use 'any' here temporarily to get results
        const orderWithDetails: Order = { ...order } // Spread the order to preserve existing properties

        // Step 3: Fetch meal names from the 'meals' table based on 'meal_id'
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('id, name, price')

        if (mealError) {
          console.error('Error fetching meal names:', mealError)
          throw new Error('FAILED_TO_FETCH_MEALS')
        }

        // Map meal_id to meal name
        const mealNamesMap = new Map(
          mealData.map((meal: any) => [meal.id, meal.name])
        )

        const mealPricesMap = new Map(
          mealData.map((meal: any) => [meal.id, meal.price])
        )

        // Step 4: Fetch 'order_item_details' for each 'order_item'
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item: OrderItem) => {
            const { data: itemDetails, error: detailsError } = await supabase
              .from('order_item_details')
              .select('id, details') // Ensure you select the right columns
              .eq('order_item_id', item.id) // Correctly link by 'id' of order_item

            if (detailsError) {
              console.error('Supabase error:', detailsError)
              throw new Error('FAILED_TO_FETCH_ORDER_ITEM_DETAILS')
            }

            // Step 5: Validate and parse the details if available
            const parsedDetails = itemDetails.map((detail: any) => {
              let parsedDetail = detail.details

              // Log the details to see what's being passed
              console.log('Details before parsing:', parsedDetail)

              // Check if the details field is a string and whether it can be parsed as JSON
              if (typeof parsedDetail === 'string') {
                // Check if it starts with a possible valid JSON format
                if (
                  parsedDetail.trim().startsWith('{') ||
                  parsedDetail.trim().startsWith('[')
                ) {
                  try {
                    parsedDetail = JSON.parse(parsedDetail)
                  } catch (e) {
                    console.error('Failed to parse details:', e)
                    parsedDetail = {} // Set to an empty object or fallback value
                  }
                } else {
                  // If it's not valid JSON, treat it as a plain string
                  parsedDetail = parsedDetail
                }
              }

              return { ...detail, details: parsedDetail }
            })

            // Return the order item with its details and meal name
            return {
              ...item,
              meal_name: mealNamesMap.get(item.meal_id),
              meal_price: mealPricesMap.get(item.meal_id),
              details: parsedDetails || [] // Ensure details are not null or undefined
            }
          })
        )

        // Return the enriched order with items and their details
        return { ...orderWithDetails, items: itemsWithDetails }
      })
    )

    await redis.set('orders', JSON.stringify(ordersWithDetails), 'EX', 3600)

    return ordersWithDetails
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getOrderById = async (id: string): Promise<Order[]> => {
  try {
    // Step 1: Check if the data exists in Redis
    const cachedData = await redis.get(`order:${id}`)
    if (cachedData) {
      console.log('Cache hit for order ID:', id)
      return JSON.parse(cachedData) as Order[]
    }

    console.log('Cache miss for order ID:', id)
    // Step 1: Query the 'orders' table and related 'order_items' and 'payments'
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        order_status,
        client_name,
        client_phone,
        total_price,
        created_at,
        items:order_items(meal_id, quantity, subtotal, order_id, id),
        payments(payment_method, amount_given, order_id)
      `
      )
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('FAILED_TO_FETCH_ORDER')
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('ORDER_NOT_FOUND')
    }

    // Step 2: Fetch 'order_item_details' for each 'order_item' (one-to-many relationship)
    const ordersWithDetails = await Promise.all(
      data.map(async (order: any) => {
        // Use 'any' here temporarily to get results
        const orderWithDetails: Order = { ...order } // Spread the order to preserve existing properties

        // Step 3: Fetch meal names from the 'meals' table based on 'meal_id'
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('id, name, price') // Assuming 'meals' table has 'id' and 'name' columns

        if (mealError) {
          console.error('Error fetching meal names:', mealError)
          throw new Error('FAILED_TO_FETCH_MEALS')
        }

        // Map meal_id to meal name
        const mealNamesMap = new Map(
          mealData.map((meal: any) => [meal.id, meal.name])
        )

        const mealPricesMap = new Map(
          mealData.map((meal: any) => [meal.id, meal.price])
        )

        // Step 4: Fetch 'order_item_details' for each 'order_item'
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item: OrderItem) => {
            const { data: itemDetails, error: detailsError } = await supabase
              .from('order_item_details')
              .select('id, details') // Ensure you select the right columns
              .eq('order_item_id', item.id) // Correctly link by 'id' of order_item

            if (detailsError) {
              console.error('Supabase error:', detailsError)
              throw new Error('FAILED_TO_FETCH_ORDER_ITEM_DETAILS')
            }

            // Step 5: Validate and parse the details if available
            const parsedDetails = itemDetails.map((detail: any) => {
              let parsedDetail = detail.details

              // Log the details to see what's being passed
              console.log('Details before parsing:', parsedDetail)

              // Check if the details field is a string and whether it can be parsed as JSON
              if (typeof parsedDetail === 'string') {
                // Check if it starts with a possible valid JSON format
                if (
                  parsedDetail.trim().startsWith('{') ||
                  parsedDetail.trim().startsWith('[')
                ) {
                  try {
                    parsedDetail = JSON.parse(parsedDetail)
                  } catch (e) {
                    console.error('Failed to parse details:', e)
                    parsedDetail = {} // Set to an empty object or fallback value
                  }
                } else {
                  // If it's not valid JSON, treat it as a plain string
                  parsedDetail = parsedDetail
                }
              }

              return { ...detail, details: parsedDetail }
            })

            // Return the order item with its details and meal name
            return {
              ...item,
              meal_name: mealNamesMap.get(item.meal_id), // Replace meal_id with the actual meal name
              meal_price: mealPricesMap.get(item.meal_id), // Replace meal_id with the actual meal name
              details: parsedDetails || [] // Ensure details are not null or undefined
            }
          })
        )

        // Return the enriched order with items and their details
        return { ...orderWithDetails, items: itemsWithDetails }
      })
    )

    // Step 4: Cache the fetched data in Redis
    await redis.setex(
      `order:${id}`,
      3600, // Cache expires in 1 hour
      JSON.stringify(ordersWithDetails)
    )

    return ordersWithDetails
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const updateOrder = async (id: string, updateData: Partial<Order>) => {
  try {
    let totalPrice = 0
    const subtotals: { meal_id: number; subtotal: number }[] = []

    // Update the main order details
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        client_name: updateData.client_name,
        client_phone: updateData.client_phone,
        order_status: updateData.order_status
      })
      .eq('id', id)

    if (orderError) {
      throw new Error('FAILED_TO_UPDATE_ORDER')
    }

    if (updateData.items && updateData.items.length > 0) {
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)

      if (deleteItemsError) {
        throw new Error('FAILED_TO_DELETE_ORDER_ITEMS')
      }

      await Promise.all(
        updateData.items.map(async (item) => {
          const { data: insertedItem, error: insertItemError } = await supabase
            .from('order_items')
            .insert({
              order_id: id,
              meal_id: item.meal_id,
              quantity: item.quantity
            })
            .select()

          if (insertItemError) {
            throw new Error('FAILED_TO_INSERT_ORDER_ITEM')
          }

          if (!insertedItem) {
            throw new Error('FAILED_TO_INSERT_ORDER_ITEM')
          }

          const orderItemId = (insertedItem as any)[0].id

          if (item.details && item.details.length > 0) {
            await Promise.all(
              item.details.map(async (detail) => {
                const { error: detailError } = await supabase
                  .from('order_item_details')
                  .insert({
                    order_item_id: orderItemId,
                    details: detail
                  })

                if (detailError) {
                  throw new Error('FAILED_TO_INSERT_DETAIL')
                }
              })
            )
          }

          const { data: mealData, error: mealError } = await supabase
            .from('meals')
            .select('price')
            .eq('id', item.meal_id)
            .single<Meal>()

          if (mealError || !mealData) {
            throw new Error('FAILED_TO_FETCH_MEAL_PRICE')
          }

          const mealPrice = mealData.price
          const subtotal = mealPrice * item.quantity
          totalPrice += subtotal

          subtotals.push({ meal_id: item.meal_id, subtotal })

          const { error: subtotalError } = await supabase
            .from('order_items')
            .update({
              subtotal: subtotal
            })
            .eq('id', orderItemId)

          if (subtotalError) {
            throw new Error('FAILED_TO_UPDATE_SUBTOTAL')
          }

          const { error: totalPriceError } = await supabase
            .from('orders')
            .update({
              total_price: totalPrice
            })
            .eq('id', id)

          if (totalPriceError) {
            throw new Error('FAILED_TO_UPDATE_TOTAL_PRICE')
          }
        })
      )
    } else {
      const { data: existingItems, error: fetchItemsError } = await supabase
        .from('order_items')
        .select('meal_id, quantity')
        .eq('order_id', id)

      if (fetchItemsError) {
        throw new Error('FAILED_TO_FETCH_ORDER_ITEMS')
      }

      const mealItems = existingItems as any

      for (const item of mealItems || []) {
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('price')
          .eq('id', item.meal_id)
          .single()

        if (mealError || !mealData) {
          throw new Error('FAILED_TO_FETCH_MEAL_PRICE')
        }

        const itemMealPrice = (mealData as any).price
        const subtotal = itemMealPrice * item.quantity
        totalPrice += subtotal

        subtotals.push({ meal_id: item.meal_id, subtotal })

        const { error: subtotalError } = await supabase
          .from('order_items')
          .update({ subtotal })
          .eq('meal_id', item.meal_id)
          .eq('order_id', id)

        if (subtotalError) {
          throw new Error('FAILED_TO_UPDATE_SUBTOTAL')
        }
      }
    }

    if (updateData.payments) {
      await Promise.all(
        updateData.payments.map(async (payment) => {
          const { data } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', id)

          if (!data || data.length === 0) {
            const { error: insertPaymentError } = await supabase
              .from('payments')
              .insert({
                payment_method: payment.payment_method,
                amount_given: payment.amount_given,
                order_id: id
              })

            if (insertPaymentError) {
              throw new Error('FAILED_TO_INSERT_PAYMENT')
            }
          } else {
            const { error: paymentError } = await supabase
              .from('payments')
              .update({
                payment_method: payment.payment_method,
                amount_given: payment.amount_given
              })
              .eq('order_id', id)

            if (paymentError) {
              throw new Error('FAILED_TO_UPDATE_PAYMENT')
            }
          }
        })
      )
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', id)

    if (error) {
      console.log(error)
    }

    if (!data || data.length === 0) {
      console.log(data)
      throw new Error('FAILED_TO_FETCH_PAYMENT')
    }

    const amount_given = (data as any)[0].amount_given
    const totalGiven = data.reduce((sum: number) => sum + amount_given, 0)
    const exchange = totalGiven - totalPrice

    if (exchange < 0) {
      throw new Error('INSUFFICIENT_PAYMENT_ERROR')
    }

    await redis.del('orders')

    return {
      message: 'Order updated successfully',
      exchange: exchange,
      totalPrice,
      subtotals
    }
  } catch (error) {
    throw error // Pass error back to controller for handling
  }
}

interface OrderId {
  id: string
  // Add other order properties here
}

const deleteOrder = async (id: string) => {
  try {
    // Check if orders exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)

    if (fetchError) {
      return { success: false, error: 'FETCH_ERROR' }
    }

    if (!existingOrder) {
      return { success: false, error: 'ITEM_NOT_FOUND' }
    }

    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: 'DELETE_ERROR' }
    }

    const cachedOrders = await redis.get('orders')
    if (cachedOrders) {
      try {
        const orderList = JSON.parse(cachedOrders) as OrderId[]
        console.log('Before filtering:', orderList.length, 'orders')
        console.log('Type of id to delete:', typeof id)

        // Convert IDs to strings and compare
        const updatedOrders = orderList.filter((order: OrderId) => {
          const orderId = String(order.id)
          const targetId = String(id)
          console.log(
            `Comparing order ID ${orderId} (${typeof orderId}) with target ID ${targetId} (${typeof targetId})`
          )
          return orderId !== targetId
        })

        console.log('After filtering:', updatedOrders.length, 'orders')

        // Verify the item was actually removed
        const itemStillExists = updatedOrders.some(
          (order) => String(order.id) === String(id)
        )
        if (itemStillExists) {
          console.error(
            'Failed to remove item from cache - item still exists after filtering'
          )
        } else {
          console.log('Successfully removed item from cache')
        }

        await redis.set('orders', JSON.stringify(updatedOrders), 'EX', 3600)

        // Verify the update
        const verificationCache = await redis.get('orders')
        const verificationList = verificationCache
          ? (JSON.parse(verificationCache) as Order[])
          : []
        console.log('Verification count:', verificationList.length, 'orders')
      } catch (parseError) {
        console.error('Error parsing/updating Redis cache:', parseError)
        await redis.del('orders')
      }
    }

    // await redis.del('orders')
    await redis.del(`order:${id}`)

    return { success: true, message: 'Order deleted successfully' }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

interface ReportData {
  meal_name: string
  total_quantity: number
  total_revenue: number // This is the total money generated by each meal
}
const getReports = async (
  period: 'day' | 'week' | 'month'
): Promise<ReportData[]> => {
  try {
    // Get the current date and calculate the time range
    const currentDate = new Date()
    let startDate: Date

    // Calculate the start date based on the period (day, week, or month)
    switch (period) {
      case 'day':
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 1)) // 1 day ago
        break
      case 'week':
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 7)) // 1 week ago
        break
      case 'month':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1)) // 1 month ago
        break
      default:
        throw new Error('Invalid period')
    }

    // Query to fetch the report data from Supabase using nested selects for relations
    const { data, error } = await supabase
      .from('order_items')
      .select(
        `
        meal_id,
        quantity,
        subtotal,
        meals (name, price),
        orders (created_at)
      `
      )
      .gt('orders.created_at', startDate.toISOString()) // Filter by date (after startDate)

    if (error) {
      throw new Error('FAILED_TO_FETCH_REPORT')
    }

    // Aggregate the data by meal_id (total quantity, total revenue)
    const aggregatedData = data.reduce((acc: any, item: any) => {
      const mealName = item.meals.name
      const mealQuantity = item.quantity
      const mealSubtotal = item.subtotal

      if (!acc[mealName]) {
        acc[mealName] = {
          total_quantity: 0,
          total_revenue: 0
        }
      }

      acc[mealName].total_quantity += mealQuantity
      acc[mealName].total_revenue += mealSubtotal

      return acc
    }, {})

    // Transform the aggregated data into an array of ReportData
    const reportData = Object.keys(aggregatedData).map((mealName) => {
      const data = aggregatedData[mealName]
      return {
        meal_name: mealName,
        total_quantity: data.total_quantity,
        total_revenue: data.total_revenue
      }
    })

    return reportData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getStatistics = async () => {
  try {
    // 1. Top 5 most sold (by quantity)
    const { data: topSellers, error: topSellersError } =
      await supabase.rpc('get_top_sellers_2')

    if (topSellersError) throw new Error('FAILED_TO_FETCH_TOP_SELLERS')

    // 2. Sales by period (by day, week, month)
    const { data: salesByPeriod, error: salesByPeriodError } =
      await supabase.rpc('get_sales_by_period')

    if (salesByPeriodError) throw new Error('FAILED_TO_FETCH_SALES_BY_PERIOD')

    // 4. Total sales per product
    const { data: totalSalesPerProduct, error: totalSalesPerProductError } =
      await supabase.rpc('get_total_sales_per_product_2')

    if (totalSalesPerProductError)
      throw new Error('FAILED_TO_FETCH_TOTAL_SALES_PER_PRODUCT')

    // 5. Revenue distribution by product
    const { data: revenueDistribution, error: revenueDistributionError } =
      await supabase.rpc('get_revenue_distribution_2')

    if (revenueDistributionError)
      throw new Error('FAILED_TO_FETCH_REVENUE_DISTRIBUTION')

    // Combine all the data into one object
    const statistics = {
      topSellers,
      salesByPeriod,
      totalSalesPerProduct,
      revenueDistribution
    }

    return statistics
  } catch (error) {
    console.error(error)
    throw new Error('FAILED_TO_FETCH_STATISTICS')
  }
}

export {
  insertOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getReports,
  getStatistics,
  getLastOrderNumber
}
