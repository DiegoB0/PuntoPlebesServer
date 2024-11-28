import { v2 as cloudinary } from "cloudinary"
import 'dotenv/config'

const cloudinary_cloud_name = process.env.CLOUDINARY_CLOUD_NAME as string
const cloudinary_api_key = process.env.CLOUDINARY_API_KEY as string
const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET as string

cloudinary.config({
  cloud_name: cloudinary_cloud_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret,
  secure: true
})

export async function uploadImage(filePath: string) {

  return await cloudinary.uploader.upload(filePath, {
    folder: "meals"
  })

}

export async function deleteImage(publicId: string) {

  return await cloudinary.uploader.destroy(publicId)

}
