import Image from "next/image"

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <div className="flex-shrink-0">
            <Image
              src="/logo-lakekonekt.png"
              alt="LAKEKONEKT - From the Lake to Your Pocket"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  )
}
