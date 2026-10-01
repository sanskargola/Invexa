import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, FlaskConical, MailCheck } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../services/authApi'
import { DEMO_VERIFICATION_CODE } from '../../store/authStore'

const screenContent: Record<string, { title: string; subtitle: string; submit: string }> = {
  login: { title: 'Welcome back', subtitle: 'Sign in to your Invexa workspace.', submit: 'Sign in' },
  register: { title: 'Create your account', subtitle: 'Verify your email and we’ll open your trading workspace.', submit: 'Create account' },
  'forgot-password': { title: 'Reset your password', subtitle: 'Enter the email on your account to get a reset link.', submit: 'Create reset link' },
  'reset-password': { title: 'Choose a new password', subtitle: 'Use at least 8 characters for your new password.', submit: 'Update password' },
  'verify-email': { title: 'Verify your email', subtitle: 'Enter the six-digit code for your new account.', submit: 'Verify email' },
}

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export default function AuthPage() {
  const { screen = 'login' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, loginAsDemo, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const isRegister = screen === 'register'
  const isForgot = screen === 'forgot-password'
  const isReset = screen === 'reset-password'
  const isVerify = screen === 'verify-email'
  const content = screenContent[screen] ?? screenContent.login
  const token = searchParams.get('token') ?? ''

  function enterDemo() {
    loginAsDemo()
    navigate('/dashboard', { replace: true, state: { notice: 'Demo account ready. You are using paper trading with sample data.' } })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    setResetUrl('')
    try {
      if (isRegister) {
        if (password !== confirmPassword) throw new Error('Your passwords do not match.')
        await authApi.register(name, email, password)
        navigate(`/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`)
        return
      }
      if (isVerify) {
        authApi.verifyEmail(email, code)
        refreshUser()
        navigate('/dashboard', { replace: true, state: { notice: 'Email verified. Your account is ready.' } })
        return
      }
      if (isForgot) {
        const resetToken = authApi.requestPasswordReset(email)
        setNotice('If an account exists for this email, a reset link is ready in this demo.')
        if (resetToken) setResetUrl(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&token=${encodeURIComponent(resetToken)}`)
        return
      }
      if (isReset) {
        if (password !== confirmPassword) throw new Error('Your passwords do not match.')
        await authApi.resetPassword(email, token, password)
        setNotice('Password updated. Sign in with your new password.')
        return
      }
      await login(email, password, remember)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setNotice(messageFrom(error))
    }
  }

  return <section className="auth-content"><div className="auth-card">
    <span className="auth-card-eyebrow">INVEXA ACCOUNT</span>
    <h1>{content.title}</h1>
    <p className="auth-subtitle">{content.subtitle}</p>
    {isVerify && <><div className="verify-icon"><MailCheck size={23} /></div><p className="auth-demo-hint">Demo verification code: <strong>{DEMO_VERIFICATION_CODE}</strong></p></>}
    <form className="auth-form" onSubmit={submit}>
      {isRegister && <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Davis" /></label>}
      {!isVerify && <label>Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>}
      {isVerify && <><input type="hidden" value={email} /><p className="auth-email-hint">Verification for <strong>{email}</strong></p><label>Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" /></label></>}
      {(screen === 'login' || isRegister || isReset) && <div className="auth-field-group"><label htmlFor="auth-password">{isReset ? 'New password' : 'Password'}</label><span className="auth-password-field"><input id="auth-password" required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete={isRegister || isReset ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></div>}
      {(isRegister || isReset) && <label>Confirm password<input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" /></label>}
      {screen === 'login' && <div className="auth-form-options"><label className="remember-me"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Keep me signed in</label><Link to="/auth/forgot-password">Forgot password?</Link></div>}
      <button className="auth-submit" type="submit">{content.submit}<ArrowRight size={15} /></button>
      {notice && <p className="auth-notice" role="status">{notice}{resetUrl && <Link to={resetUrl}>Continue to password reset</Link>}{isReset && notice.startsWith('Password updated') && <Link to="/auth/login">Go to sign in</Link>}</p>}
    </form>
    {screen === 'login' && <div className="demo-login-option"><div className="auth-divider"><span />or explore the app<span /></div><button className="auth-provider" type="button" onClick={enterDemo}><FlaskConical size={15} /><span><strong>Explore demo account</strong><small>Instant access · sample portfolio · paper trading</small></span><ArrowRight size={15} /></button></div>}
    <p className="auth-switch">{isRegister ? 'Already have an account?' : isForgot || isReset || isVerify ? <Link className="auth-back" to="/auth/login"><ArrowLeft size={13} /> Back to sign in</Link> : 'New to Invexa?'}{!isForgot && !isReset && <Link to={isRegister ? '/auth/login' : '/auth/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>}</p>
  </div><p className="auth-disclaimer">Demo accounts are stored in this browser only. Do not reuse a real password.</p></section>
}