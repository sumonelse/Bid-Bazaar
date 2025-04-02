import path from "node:path"
import fs from "node:fs/promises" // Use promises for async file operations
import os from "node:os"
import multer from "multer"
import cloudinary from "../config/cloudinaryConfig.js"
import { v4 as uuidv4 } from "uuid"
import ApiResponse from "../utils/ApiResponse.js"

// Memory storage for handling image uploads
const storage = multer.memoryStorage()

// File filter to validate image uploads
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp|jfif/i
    const extname = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = allowedFileTypes.test(file.mimetype)

    if (extname && mimetype) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type. Only image files are allowed."), false)
    }
}

// Multer upload configuration
const upload = multer({
    storage,
    fileFilter,
})

// Function to save buffer to a temporary file
const saveBufferToTempFile = async (buffer) => {
    const tempDir = os.tmpdir()
    const tempFilename = `${uuidv4()}-${Date.now()}.jpg`
    const tempFilePath = path.join(tempDir, tempFilename)

    await fs.writeFile(tempFilePath, buffer)
    return tempFilePath
}

// Reusable middleware for image uploads
export const uploadMiddleware = (
    fieldName,
    folder,
    minCount = 1,
    maxCount = 5,
    maxSize = 7 * 1024 * 1024,
    transformations = []
) => {
    return (req, res, next) => {
        const apiResponse = new ApiResponse(res) // Create an instance of ApiResponse
        const uploadOptions =
            maxCount === 1
                ? upload.single(fieldName) // Single image upload
                : upload.array(fieldName, maxCount) // Multiple image upload

        uploadOptions(req, res, async (err) => {
            // Handle Multer errors
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return apiResponse.error(
                        `File size limit exceeded. Maximum ${
                            maxSize / (1024 * 1024)
                        }MB per file.`,
                        400
                    )
                }
                if (err.code === "LIMIT_FILE_COUNT") {
                    return apiResponse.error(
                        `Maximum ${maxCount} images allowed.`,
                        400
                    )
                }
                return apiResponse.error(err.message, 400)
            } else if (err) {
                return apiResponse.error(err.message, 400)
            }

            // Validate minimum file count for multiple uploads
            const files = maxCount === 1 ? [req.file] : req.files // Normalize to array
            if (!files || files.length < minCount) {
                return apiResponse.error(
                    `At least ${minCount} images are required.`,
                    400
                )
            }

            try {
                // Process and upload images
                const uploadedImages = await Promise.all(
                    files.map(async (file) => {
                        const tempFilePath = await saveBufferToTempFile(
                            file.buffer
                        )

                        try {
                            const result = await cloudinary.uploader.upload(
                                tempFilePath,
                                {
                                    folder,
                                    public_id: file.originalname.split(".")[0], // Use original filename without extension
                                    transformation: [
                                        {
                                            width: 800,
                                            height: 600,
                                            crop: "limit",
                                        },
                                        { quality: "auto" },
                                        ...transformations,
                                    ],
                                }
                            )

                            await fs.unlink(tempFilePath) // Remove temporary file
                            return {
                                url: result.secure_url,
                                public_id: result.public_id,
                            }
                        } catch (uploadError) {
                            await fs.unlink(tempFilePath) // Clean up on error
                            throw uploadError
                        }
                    })
                )

                // Attach uploaded images to the request body
                req.body.images = uploadedImages
                next()
            } catch (uploadError) {
                console.error("Upload Error:", uploadError)
                return apiResponse.error("Image upload failed", 500)
            }
        })
    }
}
