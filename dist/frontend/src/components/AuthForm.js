"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthForm;
const react_1 = require("react");
const Input_1 = require("./ui/Input");
const Button_1 = require("./ui/Button");
const axios_1 = require("@/lib/axios");
const js_cookie_1 = require("js-cookie");
function AuthForm({ mode }) {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [firstName, setFirstName] = (0, react_1.useState)("");
    const [lastName, setLastName] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const accessToken = js_cookie_1.default.get("access_token");
        if (accessToken) {
            window.location.href = "/profile";
        }
    }, []);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (mode === "login") {
                const { data } = await axios_1.default.post("/auth/login", { email, password });
                js_cookie_1.default.set("access_token", data.access_token);
                window.location.href = "/profile";
            }
            else if (mode === "register") {
                await axios_1.default.post("/auth/register", { email, password, firstName, lastName });
                setMessage("Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.");
            }
            else if (mode === "forgot") {
                await axios_1.default.post("/auth/forgot-password", { email });
                setMessage("Đã gửi yêu cầu đặt lại mật khẩu. Vui lòng kiểm tra email.");
            }
        }
        catch (err) {
            setMessage(err.message);
        }
        finally {
            setLoading(false);
        }
    }
    return (<form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4 rounded-xl border p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">
        {mode === "login" && "Đăng nhập"}
        {mode === "register" && "Đăng ký"}
        {mode === "forgot" && "Quên mật khẩu"}
      </h1>
      {(mode === "register") && (<div className="grid grid-cols-2 gap-3">
          <Input_1.default label="Họ" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
          <Input_1.default label="Tên" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
        </div>)}
      <Input_1.default label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
      {mode !== "forgot" && (<Input_1.default label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>)}
      {message && <p className="text-sm text-gray-700">{message}</p>}
      <Button_1.default type="submit" loading={loading} className="w-full">
        {mode === "login" && "Đăng nhập"}
        {mode === "register" && "Tạo tài khoản"}
        {mode === "forgot" && "Gửi yêu cầu"}
      </Button_1.default>
    </form>);
}
//# sourceMappingURL=AuthForm.js.map