import { Link } from "react-router-dom"

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">About BidBazaar</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Your premier destination for online auctions. Find
                        unique items and great deals, or sell your own treasures
                        to our community of bidders.
                    </p>
                </div>
            </div>

            {/* Mission section */}
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our Mission
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            At BidBazaar, we're committed to creating a trusted
                            marketplace where buyers and sellers can connect,
                            transact, and thrive in a secure and transparent
                            environment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-primary-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Fair Pricing
                            </h3>
                            <p className="text-gray-600">
                                Our auction format ensures that items are sold
                                at their true market value, benefiting both
                                buyers and sellers.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-primary-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Secure Transactions
                            </h3>
                            <p className="text-gray-600">
                                We prioritize security with robust
                                authentication, encrypted communications, and
                                secure payment processing.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-primary-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Community Focus
                            </h3>
                            <p className="text-gray-600">
                                We're building a vibrant community of
                                collectors, enthusiasts, and entrepreneurs who
                                share a passion for unique items.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How it works section */}
            <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            How BidBazaar Works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our platform makes buying and selling through
                            auctions simple, transparent, and fun.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-primary-600 text-xl font-bold">
                                    1
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Browse or List
                            </h3>
                            <p className="text-gray-600">
                                Browse our wide range of auctions or list your
                                own items for sale. Creating a listing is simple
                                and takes just minutes.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-primary-600 text-xl font-bold">
                                    2
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Bid or Sell
                            </h3>
                            <p className="text-gray-600">
                                Place bids on items you're interested in, or
                                watch as others bid on your listings. Our
                                real-time updates keep you informed.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-primary-600 text-xl font-bold">
                                    3
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Win or Get Paid
                            </h3>
                            <p className="text-gray-600">
                                When an auction ends, the highest bidder wins
                                the item. Sellers receive secure payment and
                                arrange shipping with the buyer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team section */}
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our Team
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            BidBazaar is built by a passionate team of experts
                            dedicated to creating the best online auction
                            experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                name: "Alex Johnson",
                                role: "Founder & CEO",
                                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                            },
                            {
                                name: "Sarah Williams",
                                role: "CTO",
                                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                            },
                            {
                                name: "Michael Chen",
                                role: "Head of Product",
                                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                            },
                            {
                                name: "Emily Rodriguez",
                                role: "Head of Customer Success",
                                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                            },
                        ].map((person, index) => (
                            <div key={index} className="text-center">
                                <div className="mx-auto h-32 w-32 rounded-full overflow-hidden mb-4">
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {person.name}
                                </h3>
                                <p className="text-gray-600">{person.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA section */}
            <div className="bg-primary-700 text-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to start bidding?
                    </h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">
                        Join thousands of users who are already buying and
                        selling on BidBazaar.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/register"
                            className="btn bg-white text-primary-700 hover:bg-gray-100"
                        >
                            Create an Account
                        </Link>
                        <Link
                            to="/auctions"
                            className="btn bg-primary-600 text-white border border-white hover:bg-primary-500"
                        >
                            Browse Auctions
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutPage
