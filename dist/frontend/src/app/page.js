"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const Navbar_1 = require("@/components/Navbar");
const link_1 = require("next/link");
const Button_1 = require("@/components/ui/Button");
const FeatureItem_1 = require("@/components/ui/FeatureItem");
function Home() {
    return (<div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      <Navbar_1.default />
      
      
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Easy, Fast{" "}
                <span className="bg-gradient-to-r  from-yellow-200 to-pink-300 bg-clip-text text-transparent">
                  Photo Editor
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Effortless Photo Editing to Enhance, Retouch, and Transform Instantly.
                Professional results with just a few clicks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <link_1.default href="/register" className="w-full sm:w-auto">
                  <Button_1.default variant="full">
                    Try it now
                  </Button_1.default>
                </link_1.default>
                <link_1.default href="#features" className="w-full sm:w-auto">
                  <Button_1.default variant="outline">
                    Learn More
                  </Button_1.default>
                </link_1.default>
              </div>
            </div>

            
              <div className="flex justify-center lg:justify-end">
                <img src="/image_ui.png" alt="Photo Editor UI" className="rounded-2xl shadow-2xl w-full max-w-md border border-gray-200" height={560} loading="eager"/>
              </div>
          </div>
        </div>
      </section>

      

      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create stunning photos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem_1.FeatureItem title="AI Enhancement" description="Automatically enhance photos with advanced AI algorithms" icon={<span className="text-2xl">🎨</span>}/>
            <FeatureItem_1.FeatureItem title="Smart Cropping" description="Intelligent cropping and composition suggestions" icon={<span className="text-2xl">✂️</span>}/>
            <FeatureItem_1.FeatureItem title="Filters & Effects" description="Beautiful filters and effects to transform your photos" icon={<span className="text-2xl">✨</span>}/>
          </div>
        </div>
      </section>

      
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-200 to-pink-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            Ready to Transform Your Photos?
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Join thousands of users who trust our AI-powered photo editor
          </p>
          <link_1.default href="/register" className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Get Started Free
          </link_1.default>
        </div>
      </section>
    </div>);
}
//# sourceMappingURL=page.js.map