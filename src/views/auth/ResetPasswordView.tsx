import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { updatePassword, logout } from '../../services/auth.service';
import Spinner from '../../components/common/Spinner';

export default function ResetPasswordView() {
  const { theme } = useTheme();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    await logout();
    setDone(true);
  }

  if (loading) {
    return <Spinner />;
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Password updated</h1>
        <p className={`text-sm ${mutedColor}`}>Your password has been changed. Please log in with your new password.</p>
        <AuthButton type="button" onClick={() => navigate('/login')}>Go to Login</AuthButton>
      </div>
    );
  }

  // The recovery link establishes a temporary session via the URL's access
  // token -- no session here means the link was already used, expired, or
  // this page was reached directly rather than through a real reset email.
  if (!session) {
    return (
      <div className="space-y-6 text-center">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Link expired</h1>
        <p className={`text-sm ${mutedColor}`}>This password reset link is invalid or has expired. Please request a new one.</p>
        <AuthButton type="button" onClick={() => navigate('/forgot-password')}>Request a New Link</AuthButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Set a new password</h1>
        <p className={`text-sm ${mutedColor}`}>Choose a new password for your account.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput label="New Password" name="password" type="password" placeholder="••••••••" required />
        <AuthInput label="Confirm New Password" name="confirmPassword" type="password" placeholder="••••••••" required />
        {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
        <AuthButton type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Password'}</AuthButton>
      </form>
    </div>
  );
}
