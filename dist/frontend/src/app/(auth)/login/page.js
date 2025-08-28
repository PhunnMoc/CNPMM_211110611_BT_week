"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
const AuthForm_1 = require("@/components/AuthForm");
const Navbar_1 = require("@/components/Navbar");
function Page() {
    return (<div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      <Navbar_1.default />
      <div className="pt-20 pb-16 px-4">
        <div className="mx-auto max-w-md">
          <AuthForm_1.default mode="login"/>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map