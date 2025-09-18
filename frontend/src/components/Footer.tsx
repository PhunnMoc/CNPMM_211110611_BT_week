import Link from 'next/link'

export function Footer() {
   return (
      <footer className="bg-cosmic text-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {/* Company Info */}
               <div className="col-span-1 md:col-span-2">
                  <h3 className="text-2xl font-bold mb-4">Shopping Website</h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                     Your one-stop destination for quality products at great prices.
                     We're committed to providing excellent customer service and fast delivery.
                  </p>
                  <div className="flex space-x-4">
                     <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Facebook
                     </a>
                     <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Twitter
                     </a>
                     <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Instagram
                     </a>
                  </div>
               </div>

               {/* Quick Links */}
               <div>
                  <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                     <li>
                        <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                           About Us
                        </Link>
                     </li>
                     <li>
                        <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                           Contact
                        </Link>
                     </li>
                     <li>
                        <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                           Shipping Info
                        </Link>
                     </li>
                     <li>
                        <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                           Returns
                        </Link>
                     </li>
                  </ul>
               </div>

               {/* Customer Service */}
               <div>
                  <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
                  <ul className="space-y-2">
                     <li>
                        <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                           Help Center
                        </Link>
                     </li>
                     <li>
                        <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                           FAQ
                        </Link>
                     </li>
                     <li>
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                           Privacy Policy
                        </Link>
                     </li>
                     <li>
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                           Terms of Service
                        </Link>
                     </li>
                  </ul>
               </div>
            </div>

            <div className="border-t border-white/15 mt-8 pt-8 text-center">
               <p className="text-gray-400">
                  © 2024 Shopping Website. All rights reserved.
               </p>
            </div>
         </div>
      </footer>
   )
}
