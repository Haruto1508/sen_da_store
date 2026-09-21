import React, { useState, useEffect } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Sparkles,
  ShieldCheck,
  LogIn,
  Gift,
  HelpCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  RotateCw,
  Clock
} from 'lucide-react';
import { loginUser, loginWithGoogle, sendOtp } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigate, addToast }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0); // Cooldown gửi lại mã (mặc định 60s)
  const [otpValidityCountdown, setOtpValidityCountdown] = useState(0); // Thời gian hiệu lực mã OTP (mặc định 120s / 2 phút)
  const [step, setStep] = useState('login'); // 'login' | 'verify-otp'

  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Định dạng hiển thị phút:giây (ví dụ: 02:00, 01:45)
  const formatTimeMMSS = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Countdown timer cho nút gửi lại OTP (Cooldown chống spam)
  useEffect(() => {
    let interval = null;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Countdown timer cho thời gian hiệu lực thực tế của mã OTP (2 phút)
  useEffect(() => {
    let interval = null;
    if (otpValidityCountdown > 0) {
      interval = setInterval(() => {
        setOtpValidityCountdown((prev) => {
          if (prev <= 1) {
            setErrorMsg('Mã OTP đã hết thời hạn hiệu lực (2 phút). Quý khách vui lòng nhấn gửi lại mã mới!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpValidityCountdown]);

  // Khôi phục bộ đếm countdown từ sessionStorage khi đổi email hoặc tải lại trang
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    try {
      // 1. Cooldown gửi lại
      const sentAtStr = sessionStorage.getItem(`senxinh_otp_sent_at_${cleanEmail}`);
      const cooldownSec = parseInt(sessionStorage.getItem(`senxinh_otp_cooldown_${cleanEmail}`) || '60', 10);
      if (sentAtStr) {
        const sentAt = parseInt(sentAtStr, 10);
        const elapsed = Math.floor((Date.now() - sentAt) / 1000);
        const remaining = cooldownSec - elapsed;
        if (remaining > 0) {
          setOtpCountdown(remaining);
        } else {
          setOtpCountdown(0);
          sessionStorage.removeItem(`senxinh_otp_sent_at_${cleanEmail}`);
        }
      }

      // 2. Thời hạn hiệu lực OTP
      const expiresAtStr = sessionStorage.getItem(`senxinh_otp_expires_at_${cleanEmail}`);
      if (expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        const remainingValidity = Math.floor((expiresAt - Date.now()) / 1000);
        if (remainingValidity > 0) {
          setOtpValidityCountdown(remainingValidity);
        } else {
          setOtpValidityCountdown(0);
          sessionStorage.removeItem(`senxinh_otp_expires_at_${cleanEmail}`);
        }
      }
    } catch {}
  }, [email]);

  // Gửi mã OTP và chuyển sang trang/màn hình nhập OTP chuyên biệt
  const handleRequestOtpAndProceed = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập Email của bạn trước khi nhận mã OTP!');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');
    setSendingOtp(true);

    try {
      const res = await sendOtp(cleanEmail);
      setOtpSent(true);
      const cooldownSec = res.cooldownSeconds || 60;
      const validitySec = res.expiresInSeconds || 120; // 2 phút mặc định
      setOtpCountdown(cooldownSec);
      setOtpValidityCountdown(validitySec);
      try {
        sessionStorage.setItem(`senxinh_otp_sent_at_${cleanEmail.toLowerCase()}`, Date.now().toString());
        sessionStorage.setItem(`senxinh_otp_cooldown_${cleanEmail.toLowerCase()}`, cooldownSec.toString());
        sessionStorage.setItem(`senxinh_otp_expires_at_${cleanEmail.toLowerCase()}`, (Date.now() + validitySec * 1000).toString());
      } catch {}
      setStep('verify-otp');
      setOtp('');
      setInfoMsg(res.message || `Mã xác thực OTP đã được gửi đến ${cleanEmail}.`);
      if (addToast) {
        addToast(res.message || `Mã OTP đã gửi đến ${cleanEmail}!`, 'info');
      }
    } catch (err) {
      console.error('Lỗi gửi OTP:', err);
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau!');
    } finally {
      setSendingOtp(false);
    }
  };

  // Gửi lại mã OTP trong trang verify-otp
  const handleResendOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || sendingOtp || otpCountdown > 0) return;
    setErrorMsg('');
    setInfoMsg('');
    setSendingOtp(true);
    try {
      const res = await sendOtp(cleanEmail);
      const cooldownSec = res.cooldownSeconds || 60;
      const validitySec = res.expiresInSeconds || 120; // 2 phút mặc định
      setOtpCountdown(cooldownSec);
      setOtpValidityCountdown(validitySec);
      try {
        sessionStorage.setItem(`senxinh_otp_sent_at_${cleanEmail.toLowerCase()}`, Date.now().toString());
        sessionStorage.setItem(`senxinh_otp_cooldown_${cleanEmail.toLowerCase()}`, cooldownSec.toString());
        sessionStorage.setItem(`senxinh_otp_expires_at_${cleanEmail.toLowerCase()}`, (Date.now() + validitySec * 1000).toString());
      } catch {}
      setOtp('');
      setInfoMsg(res.message || `Đã gửi lại mã OTP mới đến ${cleanEmail}.`);
      if (addToast) {
        addToast(`Đã tạo mã OTP mới!`, 'info');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau!');
    } finally {
      setSendingOtp(false);
    }
  };

  // Xác thực mã OTP và hoàn tất đăng nhập (hỗ trợ auto-submit)
  const handleVerifyOtpAndLogin = async (e, explicitOtp = null) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = (explicitOtp !== null ? explicitOtp : otp).trim();
    if (!cleanOtp) {
      setErrorMsg('Vui lòng nhập mã OTP 6 chữ số đã được gửi về email của bạn!');
      return;
    }

    if (otpValidityCountdown === 0 && otpSent) {
      setErrorMsg('Mã OTP này đã hết hiệu lực (2 phút). Quý khách vui lòng nhấn "Gửi lại mã OTP" để nhận mã mới!');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginUser(cleanEmail, '', cleanOtp);

      if (res.success && res.data) {
        try {
          sessionStorage.removeItem(`senxinh_otp_sent_at_${cleanEmail.toLowerCase()}`);
          sessionStorage.removeItem(`senxinh_otp_cooldown_${cleanEmail.toLowerCase()}`);
          sessionStorage.removeItem(`senxinh_otp_expires_at_${cleanEmail.toLowerCase()}`);
        } catch {}

        const displayName = res.data.name || res.data.user?.name || 'bạn';
        const isAdmin = Boolean(
          res.data.role?.toLowerCase().includes('admin') ||
          res.data.email === 'admin@senxinh.vn'
        );

        if (addToast) {
          if (isAdmin) {
            addToast(`Chào mừng Quản trị viên ${displayName}! Chuyển đến trang quản trị... 🌿`, 'success');
          } else {
            addToast(`Chào mừng bạn trở lại, ${displayName}! 🌿`, 'info');
          }
        }

        if (onLoginSuccess) {
          onLoginSuccess(res.data, rememberMe);
        }
      }
    } catch (err) {
      console.error('Lỗi xác thực mã OTP:', err);
      const msg = err.message || '';
      const friendlyMsg = (!msg || msg.includes('Failed to fetch'))
        ? 'Không thể kết nối đến máy chủ. Quý khách vui lòng thử lại sau!'
        : msg;
      setErrorMsg(friendlyMsg);
      if (friendlyMsg.includes('quá 5 lần')) {
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo Google Identity Services / One Tap khi component mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isValidClientId = clientId && !clientId.includes('your-google-client-id') && clientId.trim() !== '';

    if (isValidClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                const res = await loginWithGoogle({ idToken: response.credential });
                if (res.success && res.data) {
                  const displayName = res.data.name || res.data.user?.name || 'bạn';
                  if (addToast) addToast(`Chào mừng bạn trở lại, ${displayName}! 🌿`, 'info');
                  if (onLoginSuccess) onLoginSuccess(res.data, rememberMe);
                }
              } catch (err) {
                console.error('Google One Tap login error:', err);
                setErrorMsg('Đăng nhập Google không thành công. Quý khách vui lòng đăng nhập bằng Email!');
              } finally {
                setLoading(false);
              }
            }
          }
        });
      } catch (e) {
        console.debug('Google One Tap init skipped:', e);
      }
    }
  }, [rememberMe, onLoginSuccess, addToast]);

  // Xử lý khi người dùng nhấn nút "Google"
  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isValidClientId = clientId && !clientId.includes('your-google-client-id') && clientId.trim() !== '';

    if (!isValidClientId) {
      console.warn('[Cấu hình] VITE_GOOGLE_CLIENT_ID chưa được thiết lập trong file .env');
      if (addToast) {
        addToast('Tính năng đăng nhập Google hiện đang được bảo trì. Quý khách vui lòng đăng nhập bằng Email!', 'info');
      }
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      if (addToast) addToast('Đang kết nối dịch vụ Google, vui lòng thử lại sau giây lát...', 'info');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setLoading(false);
            console.error('Google OAuth token error:', tokenResponse.error);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg('Đăng nhập Google không thành công. Quý khách vui lòng thử lại hoặc đăng nhập bằng Email!');
            }
            return;
          }

          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await userInfoRes.json();

            const res = await loginWithGoogle({
              accessToken: tokenResponse.access_token,
              profile
            });

            if (res.success && res.data) {
              const displayName = res.data.name || res.data.user?.name || 'bạn';
              if (addToast) {
                addToast(`Đăng nhập Google thành công! Chào mừng ${displayName} 🌿`, 'info');
              }
              if (onLoginSuccess) {
                onLoginSuccess(res.data, rememberMe);
              }
            }
          } catch (err) {
            console.error('Lỗi khi xử lý thông tin tài khoản Google:', err);
            setErrorMsg('Đăng nhập Google thất bại. Quý khách vui lòng đăng nhập bằng Email!');
          } finally {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          setLoading(false);
          console.error('Google OAuth popup error:', err);
          if (err.type !== 'popup_closed_by_user') {
            setErrorMsg('Cửa sổ đăng nhập Google bị gián đoạn hoặc bị trình duyệt chặn. Vui lòng thử lại!');
          }
        }
      });

      client.requestAccessToken();
    } catch (err) {
      setLoading(false);
      console.error('Không thể mở cửa sổ đăng nhập Google:', err);
      setErrorMsg('Không thể mở cửa sổ đăng nhập Google. Quý khách vui lòng đăng nhập bằng Email!');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-split-card">
          {/* Left Botanical Showcase */}
          <div className="auth-banner">
            <div className="auth-banner-header">
              <h2 className="auth-banner-title">
                Chăm Chút Từng Mầm Xanh, Gửi Trọn Niềm An Yên
              </h2>
              <p className="auth-banner-desc">
                Đăng nhập an toàn để theo dõi hành trình đơn hàng, lưu lại bộ sưu tập sen đá yêu thích và nhận ngàn ưu đãi thành viên độc quyền.
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="auth-benefits-list">
              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <Gift size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Ưu Đãi Thành Viên Độc Quyền</h4>
                  <p>Tích điểm mầm xanh đổi quà và nhận voucher giảm đến 20%</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <Sparkles size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Theo Dõi Trực Quan Vận Chuyển</h4>
                  <p>Cập nhật trạng thái từng bước đơn hàng từ vườn ươm đến tận tay</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Bảo Mật Tài Khoản Tuyệt Đối</h4>
                  <p>Xác thực mã OTP gửi về Email hoặc Mật khẩu bảo vệ an toàn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Content */}
          <div className="auth-content">
            {step === 'verify-otp' ? (
              /* DEDICATED OTP VERIFICATION SCREEN */
              <div className="auth-otp-screen" style={{ animation: 'fadeIn 0.25s ease' }}>
                {/* Back to Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('login');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0 0 16px 0',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại đổi email / mật khẩu</span>
                </button>

                <div className="auth-form-header" style={{ textAlign: 'center', marginBottom: '22px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#EBF4EE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    margin: '0 auto 14px auto',
                    boxShadow: '0 4px 14px rgba(46, 125, 50, 0.12)'
                  }}>
                    <KeyRound size={28} />
                  </div>

                  <h1 className="auth-title" style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
                    Nhập Mã Xác Thực OTP 🌿
                  </h1>
                  <p className="auth-subtitle" style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                    Mã xác thực 6 chữ số đã được gửi an toàn đến:
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    padding: '6px 14px',
                    background: '#F1F5F9',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    border: '1px solid #E2E8F0'
                  }}>
                    <Mail size={15} color="var(--primary)" />
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('login');
                        setErrorMsg('');
                      }}
                      title="Đổi địa chỉ email khác"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="auth-error-msg" style={{ marginBottom: '14px', fontSize: '0.86rem', padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                    <HelpCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Info Message */}
                {infoMsg && (
                  <div style={{
                    marginBottom: '14px',
                    fontSize: '0.85rem',
                    padding: '10px 14px',
                    background: '#ECFDF5',
                    borderRadius: '8px',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <span>{infoMsg}</span>
                  </div>
                )}

                {/* Form Nhập OTP */}
                <form className="auth-form" onSubmit={handleVerifyOtpAndLogin}>
                  {/* OTP Validity Countdown Badge (Hiệu lực mã 2 phút) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: otpValidityCountdown > 30 
                      ? 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)' 
                      : (otpValidityCountdown > 0 ? '#fffbeb' : '#fef2f2'),
                    border: `1px solid ${
                      otpValidityCountdown > 30 
                        ? '#bae6fd' 
                        : (otpValidityCountdown > 0 ? '#fde68a' : '#fecaca')
                    }`,
                    borderRadius: '10px',
                    padding: '8px 14px',
                    marginBottom: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock 
                        size={16} 
                        color={otpValidityCountdown > 30 ? '#0284c7' : (otpValidityCountdown > 0 ? '#d97706' : '#dc2626')} 
                      />
                      <span style={{ 
                        fontSize: '0.83rem', 
                        fontWeight: 600, 
                        color: otpValidityCountdown > 30 ? '#0369a1' : (otpValidityCountdown > 0 ? '#92400e' : '#991b1b') 
                      }}>
                        {otpValidityCountdown > 0 ? 'Mã có hiệu lực trong:' : 'Mã xác nhận đã hết hạn:'}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.98rem',
                      letterSpacing: '0.5px',
                      color: otpValidityCountdown > 30 ? '#0284c7' : (otpValidityCountdown > 0 ? '#b45309' : '#b91c1c'),
                      background: '#ffffff',
                      padding: '2px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${otpValidityCountdown > 30 ? '#e0f2fe' : (otpValidityCountdown > 0 ? '#fef3c7' : '#fee2e2')}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}>
                      {otpValidityCountdown > 0 ? formatTimeMMSS(otpValidityCountdown) : '00:00 (Hết hạn)'}
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="login-otp-code" style={{ textAlign: 'center', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Mã Xác Thực (6 chữ số)
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="login-otp-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        autoFocus
                        disabled={otpValidityCountdown === 0 && otpSent}
                        className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                        placeholder={otpValidityCountdown === 0 && otpSent ? 'Mã đã hết hạn' : '• • • • • •'}
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(val);
                          if (errorMsg) setErrorMsg('');
                          if (val.length === 6 && !loading) {
                            handleVerifyOtpAndLogin(null, val);
                          }
                        }}
                        style={{
                          textAlign: 'center',
                          fontSize: '1.6rem',
                          letterSpacing: '8px',
                          fontWeight: 700,
                          height: '52px',
                          fontFamily: 'monospace',
                          borderRadius: '10px',
                          backgroundColor: (otpValidityCountdown === 0 && otpSent) ? '#f8fafc' : undefined
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Countdown & Resend */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '14px 0 10px 0',
                    fontSize: '0.85rem'
                  }}>
                    {otpCountdown > 0 ? (
                      <span style={{ color: '#64748B' }}>
                        Gửi lại mã mới sau: <strong style={{ color: 'var(--primary)' }}>{otpCountdown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={sendingOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: 0
                        }}
                      >
                        {sendingOtp ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Đang gửi lại mã...</span>
                          </>
                        ) : (
                          <>
                            <RotateCw size={14} />
                            <span>Chưa nhận được mã? Gửi lại mã OTP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 18px 0', lineHeight: 1.45 }}>
                    Vui lòng kiểm tra thêm thư mục <strong>Thư rác (Spam)</strong> hoặc <strong>Quảng cáo</strong> nếu không thấy trong hộp thư chính.
                  </p>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading || otp.trim().length < 4 || (otpValidityCountdown === 0 && otpSent)}
                    style={{ height: '48px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang xác thực mã OTP...</span>
                      </>
                    ) : (otpValidityCountdown === 0 && otpSent) ? (
                      <span>Mã Đã Hết Hạn - Vui Lòng Gửi Lại Mã</span>
                    ) : (
                      <>
                        <LogIn size={18} />
                        <span>Xác Nhận & Đăng Nhập</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* STANDARD LOGIN SCREEN (EMAIL + OTP / PASSWORD) */
              <div>
                <div className="auth-form-header">

                  <h1 className="auth-title">Chào Mừng Bạn Đến Vườn Sen Xinh!</h1>
                </div>

                {/* Priority 1: Google Auth */}
                {/* Trust Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EBF4EE',
                  color: 'var(--primary)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '14px'
                }}>
                  <ShieldCheck size={14} />
                  <span>Đăng Nhập Bảo Mật & An Toàn</span>
                </div>
                <div className="auth-social-row" style={{ marginBottom: '18px' }}>
                  <button
                    type="button"
                    className="auth-social-btn"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    style={{
                      width: '100%',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      background: '#ffffff',
                      fontSize: '0.94rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Đăng nhập bảo mật 1 chạm với tài khoản Google"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>Tiếp Tục Với Google</span>
                  </button>
                </div>

                {/* Social Separator */}
                <div className="auth-separator" style={{ margin: '0 0 18px 0' }}>
                  <span>hoặc đăng nhập an toàn bằng email</span>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="auth-error-msg" style={{ marginBottom: '14px', fontSize: '0.86rem', padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                    <HelpCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Info Message */}
                {infoMsg && (
                  <div style={{
                    marginBottom: '14px',
                    fontSize: '0.85rem',
                    padding: '10px 14px',
                    background: '#ECFDF5',
                    borderRadius: '8px',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                    <span>{infoMsg}</span>
                  </div>
                )}

                {/* Customer Login Form: Email -> Request OTP */}
                <form className="auth-form" onSubmit={handleRequestOtpAndProceed}>
                  <div className="auth-field">
                    <label htmlFor="login-email">Địa Chỉ Email Của Bạn</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Mail size={18} />
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                        placeholder="VD: ban@gmail.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="auth-meta-row" style={{ marginTop: '14px' }}>
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Duy trì đăng nhập trên thiết bị này</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={sendingOtp || !email.trim()}
                    style={{ height: '48px', marginTop: '14px' }}
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang gửi mã OTP đến email...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng nhập</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* New Member Perk Box */}
            <div style={{
              marginTop: '18px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Gift size={18} color="#059669" />
              </div>
              <div style={{ fontSize: '0.82rem', color: '#065F46', lineHeight: 1.45 }}>
                <strong>Quà tặng thành viên mới:</strong> Tự động kích hoạt mã <strong>SENMOI50</strong> (-50.000đ) và cộng <strong>50 điểm Mầm Xanh</strong> ngay sau khi đăng nhập!
              </div>
            </div>

            {/* Guest Checkout Notice */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Bạn chỉ muốn mua hàng nhanh?{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('shop')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Mua hàng không cần tài khoản →
              </button>
            </div>

            {/* Back to Home Link */}
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className='btn btn-primary'
                onClick={() => onNavigate && onNavigate('home')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
