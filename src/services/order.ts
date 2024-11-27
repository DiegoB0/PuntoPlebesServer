import { Order, OrderItem } from '../interfaces/order.interface'
import supabase from '../config/supabase'

type OrderResponse = { id: number }
type Meal = { id: number; price: number }

const insertOrder = async (order: Order) => {
  try {
    let orderNumber = 1

    const { data: lastOrder, error: lastOrderError } = await supabase
      .from('orders')
      .select('order_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single<Order>()

    if (lastOrderError) {
      console.log('No previous orders, starting new order')
    } else {
      orderNumber = lastOrder ? (lastOrder.order_number % 100) + 1 : 1
    }

    // Step 3: Insert the order with the generated order_number and default status
    const { error: orderError } = await supabase.from('orders').insert([
      {
        order_number: orderNumber,
        order_status: 'En proceso',
        client_name: order.client_name,
        client_phone: order.client_phone,
        total_price: 0
      }
    ])

    if (orderError) {
      throw new Error('ORDER_INSERT_ERROR')
    }

    // Step 4: Retrieve the last inserted order by `order_number`
    const { data: insertedOrder, error: selectError } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .single<OrderResponse>()

    if (selectError || !insertedOrder) {
      throw new Error('ORDER_RETRIEVE_ERROR')
    }

    const orderId = insertedOrder.id
    console.log('Inserted order ID:', orderId)

    // Step 5: Calculate subtotals and insert them into the `subtotals` table
    let totalPrice = 0
    const subtotals: { meal_id: number; subtotal: number }[] = []

    for (const item of order.items) {
      // Get the price of each meal
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .select('price')
        .eq('id', item.meal_id)
        .single<Meal>()

      if (mealError || !mealData) {
        throw new Error('MEAL_FETCH_ERROR')
      }

      const mealPrice = mealData.price
      const subtotal = mealPrice * item.quantity
      totalPrice += subtotal

      // Save subtotal for reporting
      subtotals.push({ meal_id: item.meal_id, subtotal })

      // Insert the order items
      const { data: insertedItem, error: itemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: orderId,
            meal_id: item.meal_id,
            quantity: item.quantity,
            subtotal: subtotal
          }
        ])
        .select()
        .single<OrderResponse>()

      if (itemError || !insertedItem) {
        throw new Error('ORDER_ITEM_INSERT_ERROR')
      }

      const itemId = insertedItem.id
      console.log('Inserted order item ID:', itemId)

      // Step 6: Insert the order item details (if any)
      if (item.details && item.details.length > 0) {
        const { error: detailsError } = await supabase
          .from('order_item_details')
          .insert(
            item.details.map((detail) => ({
              order_item_id: itemId,
              details: detail
            }))
          )

        if (detailsError) {
          throw new Error('ORDER_ITEM_DETAILS_INSERT_ERROR')
        }
      }
    }

    // Step 7: Update the total price of the order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ total_price: totalPrice })
      .eq('id', orderId)

    if (updateError) {
      throw new Error('ORDER_TOTAL_UPDATE_ERROR')
    }

    // Step 8: Insert the payments (if any)
    if (order.payments && order.payments.length > 0) {
      const { error: paymentsError } = await supabase.from('payments').insert(
        order.payments.map((payment) => ({
          payment_method: payment.payment_method,
          amount_given: payment.amount_given,
          order_id: orderId
        }))
      )

      if (paymentsError) {
        throw new Error('PAYMENTS_INSERT_ERROR')
      }
    }

    // Step 9: Calculate exchange based on total_price and amount_given
    const totalGiven = order.payments.reduce(
      (sum, payment) => sum + payment.amount_given,
      0
    )
    const exchange = totalGiven - totalPrice

    if (exchange < 0) {
      throw new Error('INSUFFICIENT_PAYMENT_ERROR')
    }

    const data = {
      message: 'Order saved successfully',
      exchange: exchange,
      totalPrice,
      subtotals
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

const getOrders = async (): Promise<Order[]> => {
  try {
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
        })
      )
    }

    const { data, error } = await supabase.from('payments').select('*')

    if (error) {
      throw new Error('FAILED_TO_INSERT_PAYMENT')
    }

    if (!data || data.length === 0) {
      throw new Error('FAILED_TO_INSERT_PAYMENT')
    }

    const amount_given = (data as any)[0].amount_given
    const totalGiven = data.reduce((sum: number) => sum + amount_given, 0)
    const exchange = totalGiven - totalPrice

    if (exchange < 0) {
      throw new Error('INSUFFICIENT_PAYMENT_ERROR')
    }

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

const deleteOrder = async (id: string) => {
  try {
    // Check if orders exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle()

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

    return { success: true, message: 'Order deleted successfully' }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('UNKNOWN_ERROR')
    }
  }
}

export { insertOrder, getOrders, getOrderById, updateOrder, deleteOrder }
