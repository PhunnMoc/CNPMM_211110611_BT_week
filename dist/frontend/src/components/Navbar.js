"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Navbar;
const link_1 = require("next/link");
const store_1 = require("@/store");
const js_cookie_1 = require("js-cookie");
const react_1 = require("react");
function Navbar() {
    const { user } = (0, store_1.useAppSelector)((state) => state.auth);
    const accessToken = js_cookie_1.default.get("access_token");
    const [isDropdownOpen, setIsDropdownOpen] = (0, react_1.useState)(false);
    const handleLogout = () => {
        js_cookie_1.default.remove("access_token");
        window.location.href = "/";
    };
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    return (<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <link_1.default href="/" className="flex items-center space-x-2">
           
            <span className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent">
              PhotoEditor
            </span>
          </link_1.default>

          
          <div className="hidden md:flex items-center space-x-8">
            <link_1.default href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </link_1.default>
            <link_1.default href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </link_1.default>
          </div>

          
          <div className="flex items-center space-x-4">
            {accessToken ? (<div className="relative">
                <button onClick={toggleDropdown} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:opacity-80 transition-opacity">
                  {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : "U"}
                </button>
                
                
                {isDropdownOpen && (<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user ? `${user.firstName} ${user.lastName}` : "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <link_1.default href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                      Profile
                    </link_1.default>
                    <button onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Logout
                    </button>
                  </div>)}
              </div>) : (<>
                <link_1.default href="/login" className="text-gray-700 hover:text-black transition-colors">
                  Login
                </link_1.default>
                <link_1.default href="/register" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors">
                  Register
                </link_1.default>
              </>)}
          </div>
        </div>
      </div>
      
      
      {isDropdownOpen && (<div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}/>)}
    </nav>);
}
//# sourceMappingURL=Navbar.js.map