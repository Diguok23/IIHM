import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pb-16 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to LAKEKONEKT</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">From the Lake to Your Pocket</p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🛒</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Marketplace</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Buy and sell items locally</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">💼</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Jobs & Gigs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Find work opportunities</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fish Prices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Daily market prices</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">🚗</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transport</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Rides and deliveries</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
