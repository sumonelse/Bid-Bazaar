import express from "express"
import categoryController from "../controllers/categoryController.js"
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", categoryController.getAllCategories)
router.get("/:id", categoryController.getCategoryById)
router.get("/:id/products", categoryController.getProductsByCategory)

// Admin routes
router.post("/", verifyToken, isAdmin, categoryController.createCategory)
router.put("/:id", verifyToken, isAdmin, categoryController.updateCategory)
router.delete("/:id", verifyToken, isAdmin, categoryController.deleteCategory)

export default router
