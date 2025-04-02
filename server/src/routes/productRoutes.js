import express from "express"
import productController from "../controllers/productController.js"
import { verifyToken, isSeller } from "../middlewares/authMiddleware.js"
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", productController.getProducts)
router.get("/featured", productController.getFeaturedProducts)
router.get("/:id", productController.getProductById)

// Protected routes
router.post(
    "/",
    verifyToken,
    uploadMiddleware("images", "products", 1, 5),
    productController.createProduct
)
router.put(
    "/:id",
    verifyToken,
    isSeller,
    uploadMiddleware("images", "products", 1, 5),
    productController.updateProduct
)
router.delete("/:id", verifyToken, isSeller, productController.deleteProduct)
router.post("/:id/watchlist", verifyToken, productController.addToWatchlist)
router.delete(
    "/:id/watchlist",
    verifyToken,
    productController.removeFromWatchlist
)

export default router
