import { useLoginFlow } from '../hooks/useLoginFlow'
import { useFocusTrap } from '../hooks/useFocusTrap'
import tokriLogo from '../assets/tokri-logo.png'
import OtpInput from './OtpInput'

export default function LoginPopup({ onClose }) {
  const containerRef = useFocusTrap(true, onClose)
  const {
    step,
    setStep,
    mobileNumber,
    setMobileNumber,
    otp,
    setOtp,
    loading,
    handleContinue,
    handleLogin,
  } = useLoginFlow({ onSuccess: onClose })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Login to Tokriii"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative flex w-full max-w-md flex-col rounded-3xl border border-line bg-panel p-7 shadow-2xl shadow-black/40 sm:max-w-lg sm:p-8 outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted transition hover:text-white"
        >
          &#10005;
        </button>

        {step === 1 && (
          <div className="flex flex-col">
            <div className="mb-5 flex flex-col items-center gap-3 pt-2">
              <img src={tokriLogo} alt="Tokriii" className="h-14 w-auto object-contain" />
              <p className="text-center text-sm text-mint">
                Premium and exotic fruits — handpicked and delivered fresh.
              </p>
              <p className="text-center text-sm text-muted">
                Sign in with your mobile number to continue
              </p>
            </div>

            <div className="mb-5 flex items-center rounded-2xl border border-line bg-panel-2 p-3">
              <span className="text-muted">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="ml-2 w-full bg-transparent text-white outline-none placeholder:text-muted"
              />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-black transition hover:bg-brand-hover disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>

            <div className="pt-6 text-center text-xs leading-relaxed text-muted">
              By continuing, you agree to our{' '}
              <a href="/terms-and-conditions" className="text-brand underline hover:text-mint">Terms of service</a> &{' '}
              <a href="/privacy-policy" className="text-brand underline hover:text-mint">Privacy policy</a>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col pt-2">
            <div className="mb-8 flex flex-col items-center">
              <img src={tokriLogo} alt="Tokriii" className="mb-4 h-12 w-auto object-contain" />
              <h2 className="text-center text-xl font-bold text-white">Enter OTP</h2>
              <p className="mt-3 text-center text-sm leading-6 text-muted">
                We sent a 4-digit code to
              </p>
              <p className="mt-1 text-center text-sm font-semibold tracking-wide text-white">
                +91 {mobileNumber}
              </p>
            </div>

            <OtpInput value={otp} onChange={setOtp} disabled={loading} />

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || otp.length !== 4}
              className="mt-8 w-full rounded-2xl bg-brand py-3 text-sm font-semibold text-black transition hover:bg-brand-hover disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="mt-4 w-full rounded-2xl border border-line bg-panel-2 py-3 text-sm font-semibold text-mint transition hover:bg-canvas disabled:opacity-60"
            >
              Change number
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
