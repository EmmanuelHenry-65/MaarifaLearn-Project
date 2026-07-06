import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { useTheme } from '../../context/ThemeContext';
import { forgotPassword } from '../../services/auth.service';

export default function ForgotPasswordView() {
  const { theme } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '').trim();

    setSubmitting(true);
    setError(null);
    const { error: resetError } = await forgotPassword(email);
    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Forgot Password?</h1>
        <p className={`text-sm ${mutedColor}`}>Enter your email to receive a reset link.</p>
      </div>

      {sent ? (
        <p className="text-center text-sm text-emerald-400">If an account exists for that email, a reset link is on its way.</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthInput label="Email" name="email" type="email" placeholder="you@example.com" required />
          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
          <AuthButton type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Reset Link'}</AuthButton>
        </form>
      )}

      <p className={`text-center text-sm ${mutedColor}`}>
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
          Back to Login
        </Link>
      </p>
    </div>
  );
}
