import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import { useTheme } from "../../context/ThemeContext";
import { login } from "../../services/auth.service";

export default function LoginView() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const textColor = theme === "light" ? "text-slate-900" : "text-white";
  const mutedColor = theme === "light" ? "text-slate-500" : "text-gray-400";
  const dividerBg =
    theme === "light" ? "border-slate-200" : "border-[rgba(56,78,135,0.3)]";
  const dividerTextBg = theme === "light" ? "bg-white" : "bg-[#0a0e1a]";

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleNote, setGoogleNote] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await login(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Welcome Back</h1>

        <p className={`text-sm ${mutedColor}`}>
          Enter your credentials to access your account.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Sessions persist by default (Supabase stores them in localStorage),
            so a "Remember me" checkbox here would be decorative — omitted
            rather than shown as a control that does nothing. */}
        <div className="flex items-center justify-end text-xs">
          <Link
            to="/forgot-password"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <AuthButton type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </AuthButton>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${dividerBg}`}></div>
          </div>

          <div className="relative flex justify-center text-xs">
            <span className={`px-2 ${dividerTextBg} text-gray-500`}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth is on hold (mentor decision) until the provider is
            configured in Supabase — shown honestly instead of as a dead button. */}
        <AuthButton variant="secondary" type="button" onClick={() => setGoogleNote(true)}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </AuthButton>
        {googleNote && (
          <p className="text-xs text-center text-gray-500">Google sign-in is coming soon — please use your email and password for now.</p>
        )}
      </form>

      <p className={`text-center text-sm ${mutedColor}`}>
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}
