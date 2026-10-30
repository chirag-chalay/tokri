import { useEffect } from 'react'
import { Link, useNavigate } from '../lib/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import tokriLogo from '../assets/tokri-logo.png'
import LoginImageMarquee from '../components/LoginImageMarquee'
import { useLoginFlow } from '../hooks/useLoginFlow'
import OtpInput from '../components/OtpInput'

const DESKTOP_BREAKPOINT = 1024

export default function MobileLoginPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const {
    step,
    setStep,
    mobileNumber,
    setMobileNumber,
    otp,
    setOtp,
    loading,
    canContinue,
    handleContinue,
    handleLogin,
  } = useLoginFlow({
    onSuccess: () => navigate(-1),
  })

  useEffect(() => {
    const redirectDesktop = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        navigate('/', { replace: true, state: { openLogin: true } })
      }
    }

    redirectDesktop()
    window.addEventListener('resize', redirectDesktop)
    return () => window.removeEventListener('resize', redirectDesktop)
  }, [navigate])

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/profile', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (isLoggedIn) return null

  return (
    <main className="min-h-screen bg-canvas lg:hidden">
      <div className="relative">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-panel text-white shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <LoginImageMarquee />
      </div>

      <div className="px-5 pb-8">
        <div className="flex flex-col items-center text-center">
          <img src={tokriLogo} alt="Tokriii" className="h-14 w-auto object-contain" />
          <p className="mt-4 text-base font-semibold text-white">Log in or Sign up</p>
        </div>

        {step === 1 ? (
          <div className="mt-8">
            <div className="flex items-center rounded-xl border border-line bg-panel px-4 py-3.5">
              <span className="text-sm font-medium text-muted">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(event) =>
                  setMobileNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
                }
                className="ml-3 w-full bg-transparent text-base text-white outline-none placeholder:text-muted"
              />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="mt-5 w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-black transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-muted"
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-center text-lg font-bold text-white">Enter OTP</h2>
            <p className="mt-3 text-center text-sm leading-6 text-muted">
              We sent a 4-digit code to
            </p>
            <p className="mt-1 text-center text-sm font-semibold text-white">
              +91 {mobileNumber}
            </p>
            <div className="mt-8">
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || otp.length !== 4}
              className="mt-8 w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-black transition hover:bg-brand-hover disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="mt-4 w-full rounded-xl border border-line bg-panel py-3.5 text-base font-semibold text-white"
            >
              Change number
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-muted">
          By continuing, you agree to our{' '}
          <Link to="/terms-and-conditions" className="font-medium text-mint underline">
            Terms of service
          </Link>{' '}
          &{' '}
          <Link to="/privacy-policy" className="font-medium text-mint underline">
            Privacy policy
          </Link>
        </p>
      </div>
    </main>
  )
}
