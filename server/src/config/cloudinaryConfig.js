import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
import { config } from "./config"
dotenv.config()

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
})

export default cloudinary
