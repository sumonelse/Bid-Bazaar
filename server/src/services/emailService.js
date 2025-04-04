import nodemailer from "nodemailer"
import { config } from "../config/config.js"

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: config.email.service,
            auth: {
                user: config.email.user,
                pass: config.email.password,
            },
        })
    }

    // Send a generic email
    async sendEmail(to, subject, html) {
        try {
            if (!config.email.user) {
                console.warn(
                    "Email service not configured. Skipping email send."
                )
                return false
            }

            const mailOptions = {
                from: `BidBazaar <${config.email.user}>`,
                to,
                subject,
                html,
            }

            const info = await this.transporter.sendMail(mailOptions)
            console.log(`Email sent: ${info.messageId}`)
            return true
        } catch (error) {
            console.error("Error sending email:", error)
            return false
        }
    }

    // Welcome email for new users
    async sendWelcomeEmail(user) {
        const subject = "Welcome to BidBazaar!"
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Welcome to BidBazaar, ${user.name}!</h2>
                <p>Thank you for joining our community of auction enthusiasts.</p>
                <p>With your new account, you can:</p>
                <ul>
                    <li>Bid on exciting items</li>
                    <li>List your own items for auction</li>
                    <li>Track your favorite items in your watchlist</li>
                    <li>Receive notifications about auction activity</li>
                </ul>
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Happy bidding!</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent to ${user.email}. If you did not create an account, please ignore this email.
                    </p>
                </div>
            </div>
        `
        return this.sendEmail(user.email, subject, html)
    }

    // Auction won notification
    async sendAuctionWonEmail(user, product) {
        const subject = `Congratulations! You won the auction for ${product.title}`
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Congratulations, ${user.name}!</h2>
                <p>You are the winning bidder for <strong>${
                    product.title
                }</strong> with a bid of $${product.currentBid.toFixed(2)}.</p>
                <p>The seller will be in touch with you soon regarding payment and shipping details.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
                    <h3 style="margin-top: 0;">Item Details:</h3>
                    <p><strong>Item:</strong> ${product.title}</p>
                    <p><strong>Final Price:</strong> $${product.currentBid.toFixed(
                        2
                    )}</p>
                    <p><strong>Auction Ended:</strong> ${new Date(
                        product.endTime
                    ).toLocaleString()}</p>
                </div>
                <p>Thank you for participating in BidBazaar!</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent to ${user.email}.
                    </p>
                </div>
            </div>
        `
        return this.sendEmail(user.email, subject, html)
    }

    // Auction ending soon notification
    async sendAuctionEndingSoonEmail(user, product) {
        const subject = `Auction Ending Soon: ${product.title}`
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Auction Ending Soon!</h2>
                <p>The auction for <strong>${
                    product.title
                }</strong> is ending soon!</p>
                <p>Current highest bid: $${
                    product.currentBid
                        ? product.currentBid.toFixed(2)
                        : product.startingPrice.toFixed(2)
                }</p>
                <p>Don't miss your chance to win this item!</p>
                <div style="margin: 20px 0;">
                    <a href="${config.clientURL}/product/${product._id}" 
                       style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                       View Auction
                    </a>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent to ${
                            user.email
                        }. You are receiving this because you have this item in your watchlist or have placed a bid on it.
                    </p>
                </div>
            </div>
        `
        return this.sendEmail(user.email, subject, html)
    }

    // Password reset email
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${config.clientURL}/reset-password/${resetToken}`
        const subject = "Password Reset Request"
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Password Reset Request</h2>
                <p>You requested a password reset for your BidBazaar account.</p>
                <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                <div style="margin: 20px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                       Reset Password
                    </a>
                </div>
                <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent to ${user.email}.
                    </p>
                </div>
            </div>
        `
        return this.sendEmail(user.email, subject, html)
    }

    // Daily digest email
    async sendDailyDigestEmail(user, digestData) {
        const { activeBids, watchlistEndingSoon, activeListings } = digestData
        const subject = "Your BidBazaar Daily Update"
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Your BidBazaar Daily Update</h2>
                <p>Hello ${user.name},</p>
                <p>Here's your daily summary of activity on BidBazaar:</p>
                
                ${
                    activeBids > 0
                        ? `
                <div style="margin: 15px 0; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
                    <h3 style="margin-top: 0;">Your Active Bids</h3>
                    <p>You have ${activeBids} active bid${
                              activeBids !== 1 ? "s" : ""
                          }.</p>
                    <a href="${
                        config.clientURL
                    }/dashboard" style="color: #4f46e5;">View in dashboard</a>
                </div>
                `
                        : ""
                }
                
                ${
                    watchlistEndingSoon > 0
                        ? `
                <div style="margin: 15px 0; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
                    <h3 style="margin-top: 0;">Watchlist Items Ending Soon</h3>
                    <p>${watchlistEndingSoon} item${
                              watchlistEndingSoon !== 1 ? "s" : ""
                          } in your watchlist ${
                              watchlistEndingSoon !== 1 ? "are" : "is"
                          } ending within 24 hours.</p>
                    <a href="${
                        config.clientURL
                    }/dashboard" style="color: #4f46e5;">View your watchlist</a>
                </div>
                `
                        : ""
                }
                
                ${
                    activeListings > 0
                        ? `
                <div style="margin: 15px 0; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
                    <h3 style="margin-top: 0;">Your Active Listings</h3>
                    <p>You have ${activeListings} active listing${
                              activeListings !== 1 ? "s" : ""
                          }.</p>
                    <a href="${
                        config.clientURL
                    }/dashboard" style="color: #4f46e5;">View your listings</a>
                </div>
                `
                        : ""
                }
                
                <p>Thank you for being part of the BidBazaar community!</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent to ${user.email}. 
                        <a href="${
                            config.clientURL
                        }/profile" style="color: #4f46e5;">Manage email preferences</a>
                    </p>
                </div>
            </div>
        `
        return this.sendEmail(user.email, subject, html)
    }
}

export default new EmailService()
