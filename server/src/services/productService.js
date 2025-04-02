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
                sellerId: userId,
                categoryName: category.name,
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
                .populate("categoryId", "name icon")

            const total = await Product.countDocuments(query)

            return {
                products,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            }
        } catch (error) {
            throw new Error(`Failed to get products: ${error.message}`)
        }
    }

    // Helper method to build product query
    buildProductQuery(filters) {
        const query = {}
        if (filters.categoryId) query.categoryId = filters.categoryId
        if (filters.status) query.status = filters.status
        if (filters.bidType) query.bidType = filters.bidType
        if (filters.sellerId) query.sellerId = filters.sellerId
        if (filters.minPrice) query.currentBid = { $gte: filters.minPrice }
        if (filters.maxPrice) {
            query.currentBid = {
                ...query.currentBid,
                $lte: filters.maxPrice,
            }
        }
        return query
    }

    // Helper method to determine sort order
    getSortOrder(sortBy) {
        switch (sortBy) {
            case "endingSoon":
                return { endTime: 1 }
            case "recentlyAdded":
                return { createdAt: -1 }
            case "priceAsc":
                return { currentBid: 1 }
            case "priceDesc":
                return { currentBid: -1 }
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
            const product = await Product.findById(productId).populate(
                "sellerId",
                "name email avatar"
            )

            if (!product) {
                throw new Error("Product not found")
            }

            return product
        } catch (error) {
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

            if (product.sellerId.toString() !== userId) {
                throw new Error("Not authorized to update this product")
            }

            const { sellerId, ...allowedUpdates } = updates

            // Update category if categoryId is changed
            if (
                updates.categoryId &&
                updates.categoryId !== product.categoryId.toString()
            ) {
                const category = await Category.findById(updates.categoryId)
                if (!category) {
                    throw new Error("Category not found")
                }
                allowedUpdates.categoryId = category._id
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { $set: allowedUpdates },
                { new: true }
            )

            return updatedProduct
        } catch (error) {
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

            if (product.sellerId.toString() !== userId) {
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

                if (product.currentBid > product.basePrice) {
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
}

export default new ProductService()
