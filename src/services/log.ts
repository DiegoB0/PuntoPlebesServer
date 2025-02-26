import { Log } from '../entities/Log.entity'
import { User } from '../entities/User.entity'
import { AppDataSource } from '../config/typeorm'

const createLog = async (
  user: User,
  message: string,
  actionType: string
): Promise<Log> => {
  const queryRunner = AppDataSource.createQueryRunner()

  try {
    await queryRunner.startTransaction()

    // Create the log entry
    const log = new Log()
    log.user = user
    log.message = message
    log.actionType = actionType

    // Save the log
    const savedLog = await queryRunner.manager.save(log)
    console.log('New log created with ID:', savedLog.id)

    // Commit the transaction
    await queryRunner.commitTransaction()

    return savedLog
  } catch (error) {
    // Rollback on error
    await queryRunner.rollbackTransaction()
    console.error('Error creating log, transaction rolled back:', error)
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  } finally {
    // Release query runner resources
    await queryRunner.release()
  }
}

const getLogs = async (): Promise<Log[]> => {
  try {
    const logs = await AppDataSource.getRepository(Log)
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user') // join user table to get user details
      .orderBy('log.createdAt', 'DESC')
      .getMany()

    return logs
  } catch (error) {
    // Propagate the error with proper error handling
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

const getLogsByUser = async (userId: number): Promise<Log[]> => {
  try {
    // 2. Fetch logs for the specific user using TypeORM
    const logs = await AppDataSource.getRepository(Log)
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user') // join user table to get user details
      .where('log.userId = :userId', { userId })
      .orderBy('log.createdAt', 'DESC')
      .getMany()

    return logs
  } catch (error) {
    // Propagate the error with proper error handling
    throw error instanceof Error ? error : new Error('UNKNOWN_ERROR')
  }
}

export { createLog, getLogs, getLogsByUser }
