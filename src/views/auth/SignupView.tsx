import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { useTheme } from '../../context/ThemeContext';
import { signup } from '../../services/auth.service';

export default function SignupView() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const dividerBg = theme === 'light' ? 'border-slate-200' : 'border-[rgba(56,78,135,0.3)]';
  const dividerTextBg = theme === 'light' ? 'bg-white' : 'bg-[#0a0e1a]';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');
    const agreed = formData.get('agree') === 'on';

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const { data, error: signUpError } = await signup(fullName, email, password);
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate('/');
    } else {
      setConfirmationSent(true);
    }
  }

  if (confirmationSent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Check your email</h1>
        <p className={`text-sm ${mutedColor}`}>We've sent a confirmation link to your email address. Confirm it, then log in.</p>
        <Link to="/login" className="inline-block text-cyan-400 hover:text-cyan-300 font-semibold text-sm">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className={`text-2xl font-extrabold ${textColor}`}>Create Account</h1>
        <p className={`text-sm ${mutedColor}`}>Join Maarifa Learn and start your journey.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput label="Full Name" name="fullName" type="text" placeholder="John Doe" required />
        <AuthInput label="Email" name="email" type="email" placeholder="you@example.com" required />
        <AuthInput label="Password" name="password" type="password" placeholder="••••••••" required minLength={6} />
        <AuthInput label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />

        {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

        <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer">
          <input name="agree" type="checkbox" className="mt-0.5 rounded bg-[rgba(17,24,50,0.6)] border-[rgba(56,78,135,0.3)]" />
          I agree to the Terms of Service and Privacy Policy.
        </label>

        <AuthButton type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create Account'}</AuthButton>

        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center`}><div className={`w-full border-t ${dividerBg}`}></div></div>
          <div className={`relative flex justify-center text-xs`}><span className={`px-2 ${dividerTextBg} text-gray-500`}>Or continue with</span></div>
        </div>

        <AuthButton variant="secondary" type="button" disabled>
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google (coming soon)
        </AuthButton>
      </form>

      <p className={`text-center text-sm ${mutedColor}`}>
        Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Login</Link>
      </p>
    </div>
  );
}
