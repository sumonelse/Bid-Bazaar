import Product from "../models/Product.js"
import Category from "../models/Category.js"
import Bid from "../models/Bid.js"
import User from "../models/User.js"
import notificationService from "./notificationService.js"

class ProductService {
    // Create a new product listing
    async createProduct(productData, userId) {
        try {
            const category = await Category.findById(productData.categoryId)
            if (!category) {
                throw new Error("Category not found")
            }

            const product = new Product({
                ...productData,
                category: productData.categoryId, // Use the new field name
                sellerId: userId,
            })

            await product.save()

            // Add product to user's listings
            await User.findByIdAndUpdate(userId, {
                $push: { listings: product._id },
            })

            return product
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`)
        }
    }

    // Get products with filters and pagination
    async getProducts(filters = {}, page = 1, limit = 10) {
        try {
            const query = this.buildProductQuery(filters)
            const skip = (page - 1) * limit

            const products = await Product.find(query)
                .sort(this.getSortOrder(filters.sortBy))
                .skip(skip)
                .limit(limit)
                .populate("category", "name icon")
                .populate("sellerId", "name avatar")

            const total = await Product.countDocuments(query)

            return {
                products,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            console.error("Get products error details:", error)
            throw new Error(`Failed to get products: ${error.message}`)
        }
    }

    // Helper method to build product query
    buildProductQuery(filters) {
        const query = {}

        // Handle categories filter (from URL it comes as comma-separated string)
        if (filters.categories) {
            const categoryIds =
                typeof filters.categories === "string"
                    ? filters.categories.split(",")
                    : filters.categories

            if (categoryIds.length > 0) {
                query.category = { $in: categoryIds }
            }
        }

        // Handle single category filter (legacy support)
        if (filters.categoryId) {
            query.category = filters.categoryId
        }

        // Handle status filter
        if (filters.status) {
            if (filters.status === "active") {
                query.status = "live"
                query.endTime = { $gt: new Date() }
            } else if (filters.status === "ended") {
                query.$or = [
                    { status: "ended" },
                    {
                        status: "live",
                        endTime: { $lte: new Date() },
                    },
                ]
            }
        }

        // Handle seller filter
        if (filters.sellerId) {
            query.sellerId = filters.sellerId
        }

        // Handle price range filters
        if (filters.minPrice || filters.maxPrice) {
            query.currentBid = {}

            if (filters.minPrice) {
                query.currentBid.$gte = filters.minPrice
            }

            if (filters.maxPrice) {
                query.currentBid.$lte = filters.maxPrice
            }
        }

        // Handle search query
        if (filters.search) {
            query.$text = { $search: filters.search }
        }

        return query
    }

    // Helper method to determine sort order
    getSortOrder(sortBy) {
        switch (sortBy) {
            case "ending-soon":
                return { endTime: 1 }
            case "newest":
                return { createdAt: -1 }
            case "price-low":
                return { currentBid: 1 }
            case "price-high":
                return { currentBid: -1 }
            case "popular":
                return { bidCount: -1 }
            default:
                return { createdAt: -1 }
        }
    }

    // Get featured products
    async getFeaturedProducts(limit = 4) {
        try {
            return await Product.find({
                featuredItem: true,
                status: "live",
            })
                .sort({ endTime: 1 })
                .limit(limit)
        } catch (error) {
            throw new Error(`Failed to get featured products: ${error.message}`)
        }
    }

    // Get product by ID
    async getProductById(productId) {
        try {
            const product = await Product.findById(productId)
                .populate("sellerId", "name email avatar")
                .populate("category", "name icon")

            if (!product) {
                throw new Error("Product not found")
            }

            return product
        } catch (error) {
            console.error("Product fetch error details:", error)
            throw new Error(`Failed to get product: ${error.message}`)
        }
    }

    // Update product
    async updateProduct(productId, updates, userId) {
        try {
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Product not found")
            }

            if (product.sellerId.toString() !== userId.toString()) {
                throw new Error("Not authorized to update this product")
            }

            const { sellerId, ...allowedUpdates } = updates

            // Update category if categoryId is changed
            if (
                updates.categoryId &&
                updates.categoryId !== product.category.toString()
            ) {
                const category = await Category.findById(updates.categoryId)
                if (!category) {
                    throw new Error("Category not found")
                }
                allowedUpdates.category = category._id
            }

            // Ensure images is an array of strings
            if (allowedUpdates.images) {
                if (typeof allowedUpdates.images === "string") {
                    try {
                        // Try to parse if it's a JSON string
                        allowedUpdates.images = JSON.parse(
                            allowedUpdates.images
                        )
                    } catch (e) {
                        // If not a valid JSON, treat as a single image URL
                        allowedUpdates.images = [allowedUpdates.images]
                    }
                }

                // Ensure all items in the array are strings
                if (Array.isArray(allowedUpdates.images)) {
                    allowedUpdates.images = allowedUpdates.images
                        .map((img) => {
                            if (typeof img === "string") {
                                return img
                            } else if (img && img.url) {
                                return img.url
                            } else {
                                return ""
                            }
                        })
                        .filter((img) => img) // Remove any empty strings
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { $set: allowedUpdates },
                { new: true }
            )

            return updatedProduct
        } catch (error) {
            console.error("Product update error details:", error)
            throw new Error(`Failed to update product: ${error.message}`)
        }
    }

    // Delete product
    async deleteProduct(productId, userId) {
        try {
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Product not found")
            }

            if (product.sellerId.toString() !== userId.toString()) {
                throw new Error(" Not authorized to delete this product")
            }

            await Product.findByIdAndDelete(productId)
            await User.findByIdAndUpdate(userId, {
                $pull: { listings: productId },
            })

            return { message: "Product deleted successfully" }
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`)
        }
    }

    // Add product to watchlist
    async addToWatchlist(productId, userId) {
        try {
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Product not found")
            }

            const user = await User.findById(userId)
            if (user.watchlist.includes(productId)) {
                return { message: "Product already in watchlist" }
            }

            await User.findByIdAndUpdate(userId, {
                $push: { watchlist: productId },
            })

            await Product.findByIdAndUpdate(productId, {
                $inc: { watchCount: 1 },
            })

            return { message: "Added to watchlist" }
        } catch (error) {
            throw new Error(`Failed to add to watchlist: ${error.message}`)
        }
    }

    // Remove product from watchlist
    async removeFromWatchlist(productId, userId) {
        try {
            const user = await User.findById(userId)
            if (!user.watchlist.includes(productId)) {
                return { message: "Product not in watchlist" }
            }

            await User.findByIdAndUpdate(userId, {
                $pull: { watchlist: productId },
            })

            await Product.findByIdAndUpdate(productId, {
                $inc: { watchCount: -1 },
            })

            return { message: "Removed from watchlist" }
        } catch (error) {
            throw new Error(`Failed to remove from watchlist: ${error.message}`)
        }
    }

    // Check auction status and update if ended
    async checkAuctionStatus(productId) {
        try {
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Product not found")
            }

            const now = new Date()
            if (now > product.endTime && product.status !== "ended") {
                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    { $set: { status: "ended" } },
                    { new: true }
                )

                if (product.currentBid > product.startingPrice) {
                    const highestBid = await Bid.findOne({ productId }).sort({
                        amount: -1,
                    })

                    if (highestBid) {
                        await User.findByIdAndUpdate(highestBid.userId, {
                            $push: { wins: productId },
                        })

                        await notificationService.createNotification({
                            userId: highestBid.userId,
                            type: "win",
                            message: `Congratulations! You won the auction for ${product.title}`,
                            productId,
                        })

                        await notificationService.createNotification({
                            userId: product.sellerId,
                            type: "win",
                            message: `Your auction for ${product.title} has ended with a winning bid of $${highestBid.amount}`,
                            productId,
                        })
                    }
                }

                return updatedProduct
            }

            return product
        } catch (error) {
            throw new Error(`Failed to check auction status: ${error.message}`)
        }
    }

    // Get products by user ID
    async getUserProducts(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit

            const products = await Product.find({ sellerId: userId })
                .populate("category", "name icon")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)

            const total = await Product.countDocuments({ sellerId: userId })

            return {
                products,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw new Error(`Failed to get user products: ${error.message}`)
        }
    }
}

export default new ProductService()
