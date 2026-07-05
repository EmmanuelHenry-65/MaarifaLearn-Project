import { Link } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { useTheme } from '../../context/ThemeContext';

export default function ForgotPasswordView() {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Forgot Password?</h1>
        <p className={`text-sm ${mutedColor}`}>Enter your email to receive a reset link.</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <AuthInput label="Email" type="email" placeholder="you@example.com" />
        <AuthButton type="submit">Send Reset Link</AuthButton>
      </form>

      <p className={`text-center text-sm ${mutedColor}`}>
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
          Back to Login
        </Link>
      </p>
    </div>
  );
}
