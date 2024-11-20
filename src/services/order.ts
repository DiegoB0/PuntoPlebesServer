import { Order, OrderItem } from '../interfaces/order.interface'
import supabase from '../config/supabase'

type OrderResponse = { id: number }
type Meal = { id: number; price: number }

const insertOrder = async (order: Order) => {
  try {
    // Step 1: Insert the order without selecting
    const { error: orderError } = await supabase.from('orders').insert([
      {
        order_number: order.order_number,
        order_status: order.order_status,
        client_name: order.client_name,
        client_phone: order.client_phone,
        total_price: order.total_price
      }
    ])

    if (orderError) {
      throw new Error('ORDER_INSERT_ERROR')
    }

    // Step 2: Retrieve the last inserted order by `order_number`
    const { data: insertedOrder, error: selectError } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', order.order_number)
      .order('created_at', { ascending: false })
      .limit(1)
      .single<OrderResponse>()

    if (selectError || !insertedOrder) {
      throw new Error('ORDER_RETRIEVE_ERROR')
    }

    const orderId = insertedOrder.id
    console.log('Inserted order ID:', orderId)

    // Step 3: Calculate the total price based on items
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
      totalPrice += mealPrice * item.quantity

      //Save subtotal for reporting
      subtotals.push({ meal_id: item.meal_id, subtotal })

      // Insert the order items
      const { data: insertedItem, error: itemError } = await supabase
        .from('order_items')
        .insert([
          {
            order_id: orderId,
            meal_id: item.meal_id,
            quantity: item.quantity
          }
        ])
        .select()
        .single<OrderResponse>()

      if (itemError || !insertedItem) {
        throw new Error('ORDER_ITEM_INSERT_ERROR')
      }

      const itemId = insertedItem.id
      console.log('Inserted order item ID:', itemId)

      // Step 4: Insert the order item details (if any)
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

    // Step 5: Update the total price of the order
    const { error: updateError } = await supabase
      .from('orders')
      .update({ total_price: totalPrice })
      .eq('id', orderId)

    if (updateError) {
      throw new Error('ORDER_TOTAL_UPDATE_ERROR')
    }

    // Step 6: Insert the payments (if any)
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

    // Step 7: Calculate exchange based on total_price and amount_given
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
  } catch (err) {
    console.error('Unexpected error inserting order:', err)
    throw new Error('UNEXPECTED_ERROR')
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
        items:order_items(meal_id, quantity, order_id, id),
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
          .select('id, name') // Assuming 'meals' table has 'id' and 'name' columns

        if (mealError) {
          console.error('Error fetching meal names:', mealError)
          throw new Error('FAILED_TO_FETCH_MEALS')
        }

        // Map meal_id to meal name
        const mealNamesMap = new Map(
          mealData.map((meal: any) => [meal.id, meal.name])
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
              // Only parse details if it's a string (assuming the 'details' field is sometimes a stringified JSON)
              let parsedDetail = detail.details

              // Check if it's a string, then parse
              if (typeof parsedDetail === 'string') {
                try {
                  parsedDetail = JSON.parse(parsedDetail) // Parsing the stringified JSON into an object
                } catch (e) {
                  console.error('Failed to parse details:', e)
                }
              }

              return { ...detail, details: parsedDetail }
            })

            // Return the order item with its details and meal name
            return {
              ...item,
              meal_name: mealNamesMap.get(item.meal_id), // Replace meal_id with the actual meal name
              details: parsedDetails || [] // Ensure details are not null or undefined
            }
          })
        )

        // Return the enriched order with items and their details
        return { ...orderWithDetails, items: itemsWithDetails }
      })
    )

    return ordersWithDetails
  } catch (err) {
    console.error('Unexpected error fetching orders:', err)
    throw new Error('UNKNOWN_ERROR')
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
        items:order_items(meal_id, quantity, order_id, id),
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
          .select('id, name') // Assuming 'meals' table has 'id' and 'name' columns

        if (mealError) {
          console.error('Error fetching meal names:', mealError)
          throw new Error('FAILED_TO_FETCH_MEALS')
        }

        // Map meal_id to meal name
        const mealNamesMap = new Map(
          mealData.map((meal: any) => [meal.id, meal.name])
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
              // Only parse details if it's a string (assuming the 'details' field is sometimes a stringified JSON)
              let parsedDetail = detail.details

              // Check if it's a string, then parse
              if (typeof parsedDetail === 'string') {
                try {
                  parsedDetail = JSON.parse(parsedDetail) // Parsing the stringified JSON into an object
                } catch (e) {
                  console.error('Failed to parse details:', e)
                }
              }

              return { ...detail, details: parsedDetail }
            })

            // Return the order item with its details and meal name
            return {
              ...item,
              meal_name: mealNamesMap.get(item.meal_id), // Replace meal_id with the actual meal name
              details: parsedDetails || [] // Ensure details are not null or undefined
            }
          })
        )

        // Return the enriched order with items and their details
        return { ...orderWithDetails, items: itemsWithDetails }
      })
    )

    return ordersWithDetails
  } catch (err) {
    console.error('Unexpected error fetching orders:', err)
    throw new Error('UNKNOWN_ERROR')
  }
}

const updateOrder = async (id: string, updateData: Partial<Order>) => {
  try {
    // Initialize a flag to track if any update was attempted
    let updateOccurred = false
    let totalPrice = 0 // To track the new total price

    // Step 1: Update the main 'orders' table for basic details
    if (updateData.order_status || updateData.total_price) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          order_status: updateData.order_status,
          total_price: updateData.total_price // This will be recalculated later if needed
        })
        .eq('id', id)

      if (orderError) {
        console.error('Error updating order details:', orderError)
        throw new Error('FAILED_TO_UPDATE_ORDER')
      }
      updateOccurred = true
    }

    // Step 2: Update 'order_items' if any are provided
    if (updateData.items && updateData.items.length > 0) {
      await Promise.all(
        updateData.items.map(async (item) => {
          const { error: itemError } = await supabase
            .from('order_items')
            .update({
              meal_id: item.meal_id,
              quantity: item.quantity
            })
            .eq('id', item.id)

          if (itemError) {
            console.error('Error updating order item:', itemError)
            throw new Error('FAILED_TO_UPDATE_ORDER_ITEM')
          }

          // Recalculate total price based on the updated items
          const { data: mealData, error: mealError } = await supabase
            .from('meals')
            .select('price')
            .eq('id', item.meal_id)
            .single<Meal>()

          if (mealError || !mealData) {
            console.error(
              'Error fetching meal price:',
              mealError?.message || 'No data returned'
            )
            throw new Error('Error fetching meal price')
          }

          totalPrice += mealData.price * item.quantity
        })
      )
      updateOccurred = true
    }

    // Step 3: Update 'payments' if any are provided
    if (updateData.payments && updateData.payments.length > 0) {
      await Promise.all(
        updateData.payments.map(async (payment) => {
          const { error: paymentError } = await supabase
            .from('payments')
            .update({
              payment_method: payment.payment_method,
              amount_given: payment.amount_given
            })
            .eq('order_id', id) // Assumes payment records are linked by order_id

          if (paymentError) {
            console.error('Error updating payment:', paymentError)
            throw new Error('FAILED_TO_UPDATE_PAYMENT')
          }
        })
      )
      updateOccurred = true
    }

    // If no fields were updated, throw an error
    if (!updateOccurred) {
      throw new Error('No fields provided for update')
    }

    // Step 4: Update the total price of the order if it was recalculated
    if (totalPrice > 0) {
      const { error: updatePriceError } = await supabase
        .from('orders')
        .update({ total_price: totalPrice })
        .eq('id', id)

      if (updatePriceError) {
        console.error('Error updating total price:', updatePriceError.message)
        throw new Error('Error updating total price')
      }
    }

    // Step 5: Fetch the updated order to return the full data
    const updatedOrderArray = await getOrderById(id)

    if (updatedOrderArray.length === 0) {
      throw new Error('NO_ORDER_FOUND_AFTER_UPDATE')
    }

    const updatedOrder = updatedOrderArray[0]

    const returnData = {
      message: 'Order updated successfully',
      updatedOrder
    }

    return returnData
  } catch (err) {
    console.error('Unexpected error updating order:', err)
    throw new Error('UNKNOWN_UPDATE_ERROR')
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
  } catch (err) {
    console.error('Unexpected error deleting user:', err)
    return { success: false, error: 'INTERNAL_ERROR' }
  }
}

export { insertOrder, getOrders, getOrderById, updateOrder, deleteOrder }
