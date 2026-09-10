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
  RefreshCw,
  Briefcase,
  Crown
} from 'lucide-react';
import { loginWithCredentials, resetUserPassword, verifyLoginOtp, resendLoginOtp } from '../services/authService';

export default function LoginView({ onLoginSuccess, employees = [] }) {
  // Role selection: 'admin' | 'employee'
  const [loginRole, setLoginRole] = useState('admin');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  
  // Admin Login States (strictly jp@ambhujamaytri.in)
  const [adminEmail, setAdminEmail] = useState('jp@ambhujamaytri.in');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminEmailInput, setShowAdminEmailInput] = useState(false);
  
  // Employee Login States
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  // Common UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active target email for OTP verification
  const [activeTargetEmail, setActiveTargetEmail] = useState('jp@ambhujamaytri.in');

  // OTP states
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Reset Password states
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Countdown timer for Resend OTP
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

  // Handle switching role tabs
  const handleRoleChange = (role) => {
    setLoginRole(role);
    setIsOtpMode(false);
    setIsResetMode(false);
    setError('');
    setSuccessMessage('');
    setOtpValue('');
  };

  // Submit credentials (Step 1)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const isAdm = loginRole === 'admin';
    const emailToUse = isAdm 
      ? ((adminEmail || '').trim() || 'jp@ambhujamaytri.in')
      : (employeeEmail || '').trim();
    const passToUse = isAdm ? adminPassword.trim() : employeePassword.trim();

    if (!isAdm && !emailToUse) {
      setError('Please enter your work email address.');
      return;
    }

    if (!passToUse) {
      setError(isAdm ? 'Please enter the admin passcode.' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginWithCredentials(emailToUse, passToUse, employees, loginRole);
      if (res.requireOtp) {
        const destEmail = res.email || emailToUse;
        setActiveTargetEmail(destEmail);
        setIsOtpMode(true);
        setOtpValue('');
        setResendCountdown(60);
        setSuccessMessage(res.message || `A 6-digit verification code was emailed to ${destEmail}.`);
      } else if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP (Step 2)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpValue.trim() || otpValue.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const targetEmail = activeTargetEmail || (loginRole === 'admin' ? 'jp@ambhujamaytri.in' : employeeEmail);

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
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    const targetEmail = activeTargetEmail || (loginRole === 'admin' ? 'jp@ambhujamaytri.in' : employeeEmail);
    
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

  // Reset Password Handler
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
        setSuccessMessage('Password updated successfully! You can now sign in with your new password.');
        if (loginRole === 'admin') {
          setAdminPassword(newPassword);
        } else {
          setEmployeePassword(newPassword);
        }
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
            <Building2 size={32} className="text-teal-600" />
          </div>
          <h1 className="login-brand-title">MAYTRI AMBHUJA</h1>
          <p className="login-brand-tagline">Real Estate CRM &amp; Workforce Portal</p>
        </div>

        {/* Role Selector Tabs (Admin vs Employee) */}
        {!isOtpMode && !isResetMode && (
          <div className="login-role-tabs">
            <button
              type="button"
              className={`login-role-btn ${loginRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <Crown size={16} />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              className={`login-role-btn ${loginRole === 'employee' ? 'active' : ''}`}
              onClick={() => handleRoleChange('employee')}
            >
              <Briefcase size={16} />
              <span>Employee Portal</span>
            </button>
          </div>
        )}

        {/* Role & Security Banner */}
        <div className={`login-role-info-banner ${loginRole === 'admin' ? 'admin' : 'employee'}`}>
          <div className="role-info-header">
            <span className="role-badge">
              <ShieldCheck size={15} />
              <span>
                {isOtpMode 
                  ? 'Step 2: Enter 6-Digit Email OTP' 
                  : isResetMode 
                    ? 'Security & Password Setup' 
                    : loginRole === 'admin'
                      ? 'Admin Passcode Authentication'
                      : 'Employee & Staff Authentication'}
              </span>
            </span>
          </div>
          <p className="role-info-desc">
            {isOtpMode ? (
              <>
                We have sent a 6-digit one-time passcode to <strong style={{ color: '#000' }}>{activeTargetEmail}</strong>. Please enter the code below to complete sign-in.
              </>
            ) : isResetMode ? (
              'Enter your registered email address to set or update your password.'
            ) : loginRole === 'admin' ? (
              <>
                Enter your admin passcode below. A one-time verification OTP will be sent directly to <strong style={{ color: '#000' }}>jp@ambhujamaytri.in</strong>.
              </>
            ) : (
              'Enter your registered work email and password. A verification OTP will be sent directly to your email.'
            )}
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
                Enter 6-Digit OTP Code sent to {activeTargetEmail}
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
                  <span>{loginRole === 'admin' ? 'Verify OTP & Enter Admin Dashboard' : 'Verify OTP & Enter Employee Desk'}</span>
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
                <span>Back to {loginRole === 'admin' ? 'Passcode' : 'Login'}</span>
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
          /* Step 1: Login Form (Admin or Employee) */
          <form onSubmit={handleSubmit} className="login-form">
            {loginRole === 'admin' ? (
              /* Admin Form */
              <>
                {showAdminEmailInput && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="admin-email">
                      Admin Work Email
                    </label>
                    <div className="login-input-wrap">
                      <Mail size={17} className="login-input-icon" />
                      <input
                        id="admin-email"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="jp@ambhujamaytri.in"
                        className="form-input login-input"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="admin-password">
                      Admin Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAdminEmailInput(!showAdminEmailInput)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', fontSize: '0.8rem', fontWeight: 600 }}
                      className="hover:underline"
                    >
                      {showAdminEmailInput ? 'Hide Custom Email' : 'Custom Email?'}
                    </button>
                  </div>
                  <div className="login-input-wrap">
                    <Lock size={17} className="login-input-icon" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin passcode"
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
              </>
            ) : (
              /* Employee Form */
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="employee-email">
                    Employee Work Email
                  </label>
                  <div className="login-input-wrap">
                    <Mail size={17} className="login-input-icon" />
                    <input
                      id="employee-email"
                      type="email"
                      required
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="e.g. employee@maytri.com"
                      className="form-input login-input"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="employee-password">
                    Employee Password
                  </label>
                  <div className="login-input-wrap">
                    <Lock size={17} className="login-input-icon" />
                    <input
                      id="employee-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      placeholder="Enter employee password"
                      className="form-input login-input"
                      autoComplete="current-password"
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
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In &amp; Request OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setResetEmail(loginRole === 'admin' ? adminEmail : employeeEmail);
                  setIsResetMode(true);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}
                className="hover:underline"
              >
                Forgot / Reset {loginRole === 'admin' ? 'Passcode' : 'Password'}?
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
                  placeholder="e.g. jp@ambhujamaytri.in or staff@maytri.com"
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

