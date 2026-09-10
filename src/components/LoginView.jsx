import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ArrowLeft,
  Key,
  RefreshCw
} from 'lucide-react';
import { loginWithCredentials, resetUserPassword, verifyLoginOtp, resendLoginOtp } from '../services/authService';

export default function LoginView({ onLoginSuccess, employees = [] }) {
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [showAdvancedEmail, setShowAdvancedEmail] = useState(false);
  
  // Login states - strictly jp@sanghicity.in
  const [email, setEmail] = useState('jp@sanghicity.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // OTP states
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Reset states
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isOtpMode && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOtpMode, resendCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your passcode to proceed.');
      return;
    }

    const targetEmail = (email || '').trim() || 'jp@sanghicity.in';

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await loginWithCredentials(targetEmail, password, employees);
      if (res.requireOtp) {
        setIsOtpMode(true);
        setOtpValue('');
        setResendCountdown(60);
        setSuccessMessage(res.message || `A 6-digit verification code was emailed to ${res.email || targetEmail}.`);
      } else if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid passcode. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpValue.trim() || otpValue.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const targetEmail = (email || '').trim() || 'jp@sanghicity.in';

    setOtpLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await verifyLoginOtp(targetEmail, otpValue.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    const targetEmail = (email || '').trim() || 'jp@sanghicity.in';
    setResendLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await resendLoginOtp(targetEmail);
      if (res.success) {
        setResendCountdown(60);
        setSuccessMessage(res.message || `New verification code dispatched to ${targetEmail}.`);
      } else {
        setError(res.error || 'Failed to resend code.');
      }
    } catch (err) {
      setError(err.message || 'Could not resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!resetEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetUserPassword(resetEmail, newPassword, employees);
      if (res.success) {
        setSuccessMessage('Password updated successfully! You can now sign in with your new passcode.');
        setPassword(newPassword);
        setIsResetMode(false);
        setResetEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Could not reset password. Please check your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-backdrop-glow" />

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-brand-icon">
            <Building2 size={32} className="text-cyan-400" />
          </div>
          <h1 className="login-brand-title">MAYTRI AMBHUJA</h1>
          <p className="login-brand-tagline">Real Estate CRM &amp; Workforce Portal</p>
        </div>

        {/* Security Badge */}
        <div className={`login-role-info-banner ${isOtpMode ? 'employee' : 'admin'}`}>
          <div className="role-info-header">
            <span className="role-badge">
              <ShieldCheck size={14} />
              <span>
                {isOtpMode 
                  ? 'Step 2: Enter 6-Digit Email OTP' 
                  : isResetMode 
                    ? 'Security & Password Setup' 
                    : 'Step 1: Admin Passcode Authentication'}
              </span>
            </span>
          </div>
          <p className="role-info-desc">
            {isOtpMode
              ? `We have sent a 6-digit one-time passcode to ${email || 'jp@sanghicity.in'}. Please enter the code below.`
              : isResetMode 
                ? 'Enter your registered email address to set or update your passcode.'
                : 'Enter your admin passcode below. Next, a one-time OTP verification code will be sent to your email.'}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            lineHeight: 1.4
          }}>
            <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isOtpMode ? (
          /* Step 2: OTP 2FA Verification Form */
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="otp-input" style={{ textAlign: 'center', display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>
                Enter 6-Digit OTP Code
              </label>
              <div className="login-input-wrap" style={{ justifyContent: 'center' }}>
                <Key size={18} className="login-input-icon" />
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="form-input login-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.55em',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                    padding: '0.75rem 1rem 0.75rem 2.5rem'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={otpLoading || otpValue.length < 6}
            >
              {otpLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify OTP &amp; Enter Portal</span>
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsOtpMode(false);
                  setOtpValue('');
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to Passcode</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCountdown > 0 || resendLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: resendCountdown > 0 ? '#94a3b8' : '#0d9488',
                  fontWeight: 700,
                  cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {resendLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : !isResetMode ? (
          /* Step 1: Passcode Form */
          <form onSubmit={handleSubmit} className="login-form">
            {showAdvancedEmail && (
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Work Email Address
                </label>
                <div className="login-input-wrap">
                  <Mail size={17} className="login-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abbupasha61@gmail.com"
                    className="form-input login-input"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password">
                  Admin Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedEmail(!showAdvancedEmail)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', fontSize: '0.8rem', fontWeight: 600 }}
                  className="hover:underline"
                >
                  {showAdvancedEmail ? 'Hide Email' : 'Custom Email?'}
                </button>
              </div>
              <div className="login-input-wrap">
                <Lock size={17} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode (e.g. sanghicity.in)"
                  className="form-input login-input"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <span>Verify Passcode &amp; Request OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setResetEmail(email);
                  setIsResetMode(true);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}
                className="hover:underline"
              >
                Forgot / Reset Passcode?
              </button>
            </div>
          </form>
        ) : (
          /* Reset Password Form */
          <form onSubmit={handleResetSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Registered Work Email
              </label>
              <div className="login-input-wrap">
                <Mail size={17} className="login-input-icon" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. admin@maytri.com"
                  className="form-input login-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password (Min. 6 characters)
              </label>
              <div className="login-input-wrap">
                <Lock size={17} className="login-input-icon" />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="form-input login-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="login-input-wrap">
                <Lock size={17} className="login-input-icon" />
                <input
                  id="confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input login-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Update &amp; Set Password</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setIsResetMode(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '0.25rem'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        <div className="login-footer-note">
          <span>Protected Real Estate Portal • Telangana RERA P02400007647</span>
        </div>
      </div>
    </div>
  );
}

