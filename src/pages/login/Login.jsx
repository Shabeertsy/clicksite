import React, { useState } from "react";
import useAuthStore from "../../store/authStore";

// Country code options (add more as needed)
const countryCodes = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
];

export default function LoginForm() {
  const { user, login, logout, loading, error } = useAuthStore();
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Combine country code and phone for login
  const handleLogin = (e) => {
    e.preventDefault();
    const fullPhone = countryCode + phone;
    login(fullPhone, password);
  };

  if (user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)" }}>
        <div className="bg-white rounded shadow-lg p-4 w-100" style={{ maxWidth: 400, textAlign: "center" }}>
          <h2 className="h4 font-weight-bold mb-3 text-dark">Welcome, {user.name} 🎉</h2>
          <button
            onClick={logout}
            className="btn btn-danger mt-3 px-4 py-2 font-weight-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)" }}>
      <form
        className="bg-white rounded shadow-lg p-4 w-100"
        style={{ maxWidth: 400 }}
        onSubmit={handleLogin}
      >
        <h1 className="h3 font-weight-bold text-center text-dark mb-2">Sign In</h1>
        <p className="text-center text-secondary mb-3">Welcome back! Please login to your account.</p>
        <div className="mb-3">
          <label className="form-label font-weight-semibold">Phone Number</label>
          <div className="input-group">
            <select
              className="form-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{ maxWidth: 110 }}
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
              maxLength={12}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label font-weight-semibold">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-100 font-weight-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        <div className="text-center text-muted small mt-4">
          &copy; {new Date().getFullYear()} Click4Trip. All rights reserved.
        </div>
      </form>
    </div>
  );
}
