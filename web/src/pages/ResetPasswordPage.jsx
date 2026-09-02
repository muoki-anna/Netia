import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ResetPasswordPage = () => {
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    if (!token) {
      return setError('Invalid or missing reset token');
    }

    setLoading(true);

    try {
      await confirmPasswordReset(token, password, passwordConfirm);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err?.response?.message || 'Failed to reset password. The link might have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-foreground">Password Reset Successful</h1>
        <p className="mt-4 text-muted-foreground">
          Your password has been reset successfully. Redirecting you to login...
        </p>
        <Link to="/login" className="mt-6 font-medium text-primary hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-foreground">Set New Password</h1>
      <p className="mt-2 text-muted-foreground">
        Please enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="passwordConfirm" className="text-sm font-medium text-foreground">
            Confirm New Password
          </label>
          <input
            id="passwordConfirm"
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
