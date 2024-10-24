import { Router } from 'express'
import { readdirSync } from 'fs'

const PATH_ROUTER = `${__dirname}`
const router = Router()

/**
 * Clean the route names by removing the file extension
 *
 * @param {string} fileName - The name of the file.
 * @returns {string} The cleaned route name.
 */
const cleanFileName = (fileName: string) => {
  const file = fileName.split('.').shift()
  return file
}

/**
 * Dynamically loads and registers routes by reading the files in the route directory.
 * It imports and mounts each route file, except for 'index', to the router.
 *
 * @param {string[]} fileNames - Array of file names in the routes directory.
 * @returns {void} No return value.
 */
readdirSync(PATH_ROUTER).filter((fileName) => {
  const cleanName = cleanFileName(fileName)
  if (cleanName !== 'index') {
    import(`./${cleanName}`)
      .then((moduleRouter) => {
        console.log(`Route /${cleanName} loaded`)
        router.use(`/${cleanName}`, moduleRouter.router)
      })
      .catch((err) => {
        console.error(`Failed to load route /${cleanName}:`, err)
      })
  }
})

export { router }
