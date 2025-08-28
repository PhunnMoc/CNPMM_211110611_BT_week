"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
const react_1 = require("react");
const axios_1 = require("@/lib/axios");
const js_cookie_1 = require("js-cookie");
const Navbar_1 = require("@/components/Navbar");
function Page() {
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const token = js_cookie_1.default.get("access_token");
        if (!token) {
            window.location.href = "/login";
            return;
        }
        const fetchProfile = async () => {
            try {
                const { data } = await axios_1.default.get("/auth/me");
                setProfile(data);
            }
            catch (e) {
                setError(e.message);
            }
        };
        fetchProfile();
    }, []);
    if (error) {
        return (<div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <Navbar_1.default />
        <div className="pt-20 pb-16 px-4">
          <div className="mx-auto max-w-2xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          </div>
        </div>
      </div>);
    }
    if (!profile) {
        return (<div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <Navbar_1.default />
        <div className="pt-20 pb-16 px-4">
          <div className="mx-auto max-w-2xl">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      <Navbar_1.default />
      <div className="pt-20 pb-16 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600 mt-2">Photo Editor User</p>
            </div>

            <div className="space-y-6">
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Email</span>
                    <span className="text-gray-900">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">First Name</span>
                    <span className="text-gray-900">{profile.firstName || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Last Name</span>
                    <span className="text-gray-900">{profile.lastName || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 font-medium">Email Verified</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.isEmailVerified
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"}`}>
                      {profile.isEmailVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium" onClick={() => {
            js_cookie_1.default.remove("access_token");
            window.location.href = "/";
        }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map