import { redis } from '../config/redis'
import { Order } from '../entities/Orders.entity'
import moment from 'moment-timezone'
import { Payment } from '../entities/Payments.entity'
import { OrderItem } from '../entities/OrderItems.entity'
import { OrderItemDetail } from '../entities/OrderItemDetails.entity'
import { Meal } from '../entities/Meals.entity'
import { AppDataSource } from '../config/typeorm'
import { In, Between } from 'typeorm'
import { OrderStatus } from '../entities/enums/OrderStatus.enum'
import { Repository } from 'typeorm'
import { User } from '../entities/User.entity'
import { createLog } from './log'
import { ActionType } from '../entities/enums/ActionType.enum'
import { Modificador } from '../entities/Modificadores.entity'

const orderRepo: Repository<Order> = AppDataSource.getRepository(Order)
const userRepo: Repository<User> = AppDataSource.getRepository(User)
const modifierRepo: Repository<Modificador> =
  AppDataSource.getRepository(Modificador)

const insertOrder = async (orderData: any, userEmail: string): Promise<any> => {
  console.log(userEmail)
  const user = await userRepo.findOne({ where: { email: userEmail } })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  const queryRunner = AppDataSource.createQueryRunner()

  try {
    await queryRunner.startTransaction()

    // -------------------------------
    // 1. Calculate order number based on business day (starting at 3am)
    // -------------------------------
    let now = moment()
    if (now.hour() < 3) {
      now = now.subtract(1, 'day')
    }
    const startOfDay = moment(now).set({
      hour: 3,
      minute: 0,
      second: 0,
      millisecond: 0
    })
    const endOfDay = moment(startOfDay).add(1, 'day')

    // Query orders for the current business day using Between operator
    const ordersToday = await queryRunner.manager.find(Order, {
      where: { created_at: Between(startOfDay.toDate(), endOfDay.toDate()) }
    })
    const nextOrderNumber = ordersToday.length + 1

    // -------------------------------
    // 2. Insert the main order
    // -------------------------------
    const order = new Order()
    order.order_number = nextOrderNumber
    order.order_status = orderData.order_status || OrderStatus.Proceso
    order.client_name = orderData.client_name
    order.client_phone = orderData.client_phone
    order.user = user

    // We will calculate total_price based on items below
    let totalPrice = 0
    const subtotals: { meal_id: number; subtotal: number }[] = []

    // -------------------------------
    // 3. Process order items and details, and calculate totals
    // -------------------------------
    const orderItems: OrderItem[] = []
    const orderItemDetails: OrderItemDetail[] = []
    const itemMealIds = orderData.items.map(
      (item: { meal_id: number }) => item.meal_id
    )

    const mealRepository = queryRunner.manager.getRepository(Meal)
    // Fetch all required meals at once
    const meals = await mealRepository.findBy({ id: In(itemMealIds) })
    const mealMap = new Map(meals.map((meal) => [meal.id, meal]))

    orderData.items.forEach(
      async (item: {
        meal_id: number
        quantity: number
        details?: string[]
      }) => {
        const meal = mealMap.get(item.meal_id)
        if (!meal) {
          throw new Error(`Meal with ID ${item.meal_id} not found`)
        }

        // Calculate subtotal for this item (meal.price * quantity)
        const itemSubtotal = meal.price * item.quantity
        totalPrice += itemSubtotal
        subtotals.push({ meal_id: item.meal_id, subtotal: itemSubtotal })

        // Create the order item
        const orderItem = new OrderItem()
        orderItem.order = order
        orderItem.meal = meal
        orderItem.quantity = item.quantity
        orderItems.push(orderItem)

        if (item.details && item.details.length) {
          const details = item.details || []

          const selectedModifiers = await modifierRepo.find({
            where: {
              id: In(details)
            }
          })
          selectedModifiers.forEach((modifier) => {
            const orderItemDetail = new OrderItemDetail()
            orderItemDetail.orderItem = orderItem
            orderItemDetail.details = [modifier]
            orderItemDetails.push(orderItemDetail)
          })
        }

        // ==================== LAST APPROACH WITH DETAILS AS ARRAY OF STRINGS ============================
        // Create order item details (if any)
        // if (item.details && item.details.length > 0) {
        //   item.details.forEach((detail: string) => {
        //     const orderItemDetail = new OrderItemDetail()
        //     orderItemDetail.orderItem = orderItem
        //     orderItemDetail.details = [detail]
        //     orderItemDetails.push(orderItemDetail)
        //   })
        // }
      }
    )

    order.total_price = totalPrice

    // Save the order and obtain the saved order (with id, created_at, etc.)
    const savedOrder = await queryRunner.manager.save(order)
    console.log('New order inserted with ID:', savedOrder.id)

    // Update order relationship for order items and perform bulk insert
    orderItems.forEach((item) => (item.order = savedOrder))
    await queryRunner.manager.save(OrderItem, orderItems)
    await queryRunner.manager.save(OrderItemDetail, orderItemDetails)
    console.log('Order items and details inserted successfully.')

    // -------------------------------
    // 4. Insert payments and compute exchange
    // -------------------------------
    let totalPayments = 0
    const payments = orderData.payments.map(
      (payment: { payment_method: string; amount_given: number }) => {
        totalPayments += payment.amount_given
        const newPayment = new Payment()
        newPayment.order = savedOrder
        newPayment.payment_method = payment.payment_method
        newPayment.amount_given = payment.amount_given
        return newPayment
      }
    )

    // Validate that the totalPayments is greater than or equal to totalPrice
    // if (totalPayments < totalPrice) {
    //   throw new Error('Insufficient payment amount')
    // }

    await queryRunner.manager.save(Payment, payments)
    console.log('Payments inserted successfully.')

    // Calculate exchange (difference between total amount given and total price)
    const exchange = totalPayments - totalPrice

    // Commit the transaction
    await queryRunner.commitTransaction()
    console.log('Transaction committed successfully.')

    // Drop the redis cache
    redis.del('orders')

    // Log for logs table
    createLog(user, 'Tomo una nueva orden', ActionType.Create)

    // -------------------------------
    // 5. Return result
    // -------------------------------
    return {
      message: 'Order saved successfully',
      exchange,
      totalPrice,
      subtotals
    }
  } catch (error) {
    // Rollback on error
    await queryRunner.rollbackTransaction()
    console.error('Error inserting order, transaction rolled back:', error)
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  } finally {
    // Release query runner resources
    await queryRunner.release()
  }
}

const getOrders = async (): Promise<Order[]> => {
  try {
    // 1. Check Redis cache for orders
    const cachedOrders = await redis.get('orders')
    if (cachedOrders) {
      console.log('Returning orders from cache')
      return JSON.parse(cachedOrders)
    }

    console.log('Cache miss: Fetching orders from database')

    const orders = await orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.orderItemDetails', 'orderItemDetail')
      .leftJoinAndSelect('orderItem.meal', 'meal')
      .leftJoinAndSelect('order.payments', 'payment')
      .leftJoinAndSelect('order.user', 'user')
      .getMany()

    // 3. Check if orders were found
    if (!orders || orders.length === 0) {
      // Alternatively, you could return an empty array if that suits your use case
      throw new Error('NO_ORDER_FOUND')
    }

    // 4. Cache the fetched orders in Redis for 1 hour (3600 seconds)
    await redis.set('orders', JSON.stringify(orders), 'EX', 3600)

    return orders
  } catch (error) {
    // Propagate the error with proper error handling
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    // 1. Check Redis cache for the specific order
    const cachedOrder = await redis.get(`order:${orderId}`)
    if (cachedOrder) {
      console.log(`Returning order ${orderId} from cache`)
      return JSON.parse(cachedOrder)
    }

    console.log(`Cache miss: Fetching order ${orderId} from database`)

    // 2. Fetch the order with related data using TypeORM query builder
    const order = await orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.orderItemDetails', 'orderItemDetail')
      .leftJoinAndSelect('orderItem.meal', 'meal')
      .leftJoinAndSelect('order.payments', 'payment')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.id = :orderId', { orderId })
      .getOne()

    // 3. Check if the order was found
    if (!order) {
      throw new Error('ORDER_NOT_FOUND')
    }

    // 4. Cache the fetched order in Redis for 1 hour
    await redis.set(`order:${orderId}`, JSON.stringify(order), 'EX', 3600)

    return order
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const updateOrder = async (
  orderId: number,
  orderData: any,
  userEmail: string
): Promise<any> => {
  const queryRunner = AppDataSource.createQueryRunner()

  try {
    console.log(userEmail)
    const user = await userRepo.findOne({ where: { email: userEmail } })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    await queryRunner.startTransaction()

    // Fetch the order to update
    const order = await queryRunner.manager.findOne(Order, {
      where: { id: orderId }
    })

    if (!order) {
      throw new Error('ORDER_NOT_FOUND')
    }

    // Update order properties with the new data (only if the data exists)
    if (orderData.order_status) {
      order.order_status = orderData.order_status
      order.delivered_at = new Date()
    }
    if (orderData.client_name) {
      order.client_name = orderData.client_name
    }
    if (orderData.client_phone) {
      order.client_phone = orderData.client_phone
    }
    //Modify the new user that modified the order
    if (user) {
      order.user = user
    }

    // If items are provided, process the items update
    let totalPrice = 0
    const subtotals: { meal_id: number; subtotal: number }[] = []

    if (orderData.items && Array.isArray(orderData.items)) {
      const orderItems: OrderItem[] = []
      const orderItemDetails: OrderItemDetail[] = []
      const itemMealIds = orderData.items.map(
        (item: { meal_id: number }) => item.meal_id
      )

      const mealRepository = queryRunner.manager.getRepository(Meal)
      const meals = await mealRepository.findBy({ id: In(itemMealIds) })
      const mealMap = new Map(meals.map((meal) => [meal.id, meal]))

      orderData.items.forEach(
        async (item: {
          meal_id: number
          quantity: number
          details?: string[]
        }) => {
          const meal = mealMap.get(item.meal_id)
          if (!meal) {
            throw new Error(`Meal with ID ${item.meal_id} not found`)
          }

          const itemSubtotal = meal.price * item.quantity
          totalPrice += itemSubtotal
          subtotals.push({ meal_id: item.meal_id, subtotal: itemSubtotal })

          const orderItem = new OrderItem()
          orderItem.order = order
          orderItem.meal = meal
          orderItem.quantity = item.quantity
          orderItems.push(orderItem)

          if (item.details && item.details.length > 0) {
            const details = item.details || []

            const selectedModifiers = await modifierRepo.find({
              where: {
                id: In(details)
              }
            })

            selectedModifiers.forEach((modifier) => {
              const orderItemDetail = new OrderItemDetail()
              orderItemDetail.orderItem = orderItem

              orderItemDetail.details = [modifier]

              orderItemDetails.push(orderItemDetail)
            })
          }
        }
      )

      // Save the updated order items and item details
      await queryRunner.manager.save(OrderItem, orderItems)
      await queryRunner.manager.save(OrderItemDetail, orderItemDetails)
    }

    // Update the total price after processing the items
    order.total_price = totalPrice || order.total_price

    // Save the updated order
    await queryRunner.manager.save(order)

    // Commit the transaction
    await queryRunner.commitTransaction()

    // Drop the redis cache
    redis.del('orders')

    // Log for logs table
    createLog(
      user,
      `Modifico la orden con el ID: ${orderId}`,
      ActionType.Update
    )

    return {
      message: 'Order updated successfully',
      totalPrice,
      subtotals
    }
  } catch (error) {
    await queryRunner.rollbackTransaction()
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  } finally {
    await queryRunner.release()
  }
}

const deleteOrder = async (
  orderId: number,
  userEmail: string
): Promise<void> => {
  try {
    console.log(userEmail)
    const user = await userRepo.findOne({ where: { email: userEmail } })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    // 1. Check if the order exists
    const order = await orderRepo.findOne({ where: { id: orderId } })
    if (!order) {
      throw new Error('ORDER_NOT_FOUND')
    }

    // 2. Delete the order from the database
    await orderRepo.remove(order)

    // 3. Remove the cached order from Redis
    await redis.del(`order:${orderId}`)
    await redis.del('orders') // Invalidate cached orders list

    // Log for logs table
    createLog(user, `Elimino la orden con el ID: ${orderId}`, ActionType.Delete)

    console.log(`Order ${orderId} deleted successfully`)
  } catch (error) {
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getSalesByPeriod = async (
  period: 'day' | 'week' | 'month' = 'day'
): Promise<any[]> => {
  try {
    let startDate: Date
    let endDate: Date

    const today = moment()

    // Set the date range based on the period
    switch (period) {
      case 'week':
        startDate = today.startOf('week').toDate()
        endDate = today.endOf('week').toDate()
        break
      case 'month':
        startDate = today.startOf('month').toDate()
        endDate = today.endOf('month').toDate()
        break
      case 'day':
      default:
        startDate = today.startOf('day').toDate()
        endDate = today.endOf('day').toDate()
        break
    }

    const salesQuery = AppDataSource.getRepository(Order)
      .createQueryBuilder('orders')
      .select('DATE(orders.created_at)', 'created_at')
      .addSelect('SUM(orders.total_price)', 'total_sales')
      .leftJoin('orders.orderItems', 'orderItem') // Join with orderItems
      .leftJoin('orderItem.meal', 'meal') // Join with meal to get meal name
      .addSelect('meal.name', 'meal_name') // Select meal name
      .addSelect('SUM(orderItem.quantity)', 'total_quantity') // Get total quantity sold for each meal
      .groupBy('DATE(orders.created_at)') // Group by date
      .addGroupBy('meal.name') // Group by meal name
      .orderBy('created_at', 'DESC')
      .where('orders.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })

    // Execute the query
    const sales = await salesQuery.getRawMany()

    // Format the result to match your desired structure
    const formattedSales = sales.reduce((acc, sale) => {
      const date = sale.created_at
      const mealName = sale.meal_name
      const quantity = parseFloat(sale.total_quantity)

      // Find the sale for the specific date, or create a new one if it doesn't exist
      const existingSale = acc.find((item: any) => item.created_at === date)

      if (existingSale) {
        // If the meal already exists in the sales data, add the quantity
        existingSale.meals_sold[mealName] =
          (existingSale.meals_sold[mealName] || 0) + quantity
        existingSale.total_sales = parseFloat(sale.total_sales)
      } else {
        // If this is a new sale entry, create one
        acc.push({
          created_at: date,
          total_sales: parseFloat(sale.total_sales),
          meals_sold: {
            [mealName]: quantity
          }
        })
      }

      return acc
    }, [])

    return formattedSales
  } catch (error) {
    console.error('Error fetching sales by period:', error)
    throw new Error('FAILED_TO_FETCH_SALES')
  }
}
const getLastOrderNumber = async (): Promise<number> => {
  try {
    const lastOrder = await AppDataSource.getRepository(Order)
      .createQueryBuilder('order')
      .orderBy('order.created_at', 'DESC')
      .getOne()

    if (!lastOrder) {
      throw new Error('NO_ORDER_FOUND')
    }

    return lastOrder.order_number
  } catch (error) {
    console.error('Error fetching last order number:', error)
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getNextOrderNumber = async (): Promise<number> => {
  const queryRunner = AppDataSource.createQueryRunner()

  try {
    await queryRunner.startTransaction()

    // Calculate order number based on business day (starting at 3am)
    let now = moment()
    if (now.hour() < 3) {
      now = now.subtract(1, 'day')
    }
    const startOfDay = moment(now).set({
      hour: 3,
      minute: 0,
      second: 0,
      millisecond: 0
    })
    const endOfDay = moment(startOfDay).add(1, 'day')

    // Query orders for the current business day using Between operator
    const ordersToday = await queryRunner.manager.find(Order, {
      where: { created_at: Between(startOfDay.toDate(), endOfDay.toDate()) }
    })
    const nextOrderNumber = ordersToday.length + 1

    await queryRunner.commitTransaction()
    return nextOrderNumber
  } catch (error) {
    await queryRunner.rollbackTransaction()
    console.error('Error fetching next order number:', error)
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  } finally {
    await queryRunner.release()
  }
}

export {
  insertOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
  getSalesByPeriod,
  getLastOrderNumber,
  getNextOrderNumber
}
