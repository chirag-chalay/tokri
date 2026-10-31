import { useEffect, useState } from 'react'
import { Link } from '../lib/navigation'
import { Truck, ShieldCheck, Clock, Leaf, Mail, Phone, MapPin } from 'lucide-react'
import tokriLogo from '../assets/tokri-logo.png'
import playStoreIcon from '../assets/play-store.svg'
import { fetchJson } from '../lib/api'

const socialNetworks = [
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        aria-hidden="true"
        data-icon="instagram"
      >
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
      </svg>
    ),
  },
  {
    key: 'threads',
    label: 'Threads',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798c-.31-.71-.873-1.3-1.634-1.75c-.192 1.352-.622 2.446-1.284 3.272c-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964c-.065-1.19.408-2.285 1.33-3.082c.88-.76 2.119-1.207 3.583-1.291a14 14 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757c-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32l-1.757-1.18c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388q.163.07.321.142c1.49.7 2.58 1.761 3.154 3.07c.797 1.82.871 4.79-1.548 7.158c-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69q-.362 0-.739.021c-1.836.103-2.98.946-2.916 2.143c.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221" />
      </svg>
    ),
  },
  {
    key: 'x',
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z" />
      </svg>
    ),
  },
]

const AppStoreIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-slate-900" aria-hidden="true">
    <path d="M16.365 12.67c-.03-2.86 2.35-4.27 2.37-4.28-1.29-1.87-3.3-2.13-4.01-2.16-1.7-.17-3.34 1.01-4.2 1.01-.88 0-2.22-.98-3.64-.95-1.88.03-3.6 1.09-4.57 2.77-1.95 3.38-.5 8.39 1.4 11.11.93 1.34 2.04 2.84 3.5 2.77 1.4-.06 1.93-.9 3.63-.9 1.68 0 2.14.9 3.63.87 1.5-.03 2.45-1.36 3.41-2.71 1.07-1.56 1.51-3.07 1.53-3.15-.03-.01-2.94-1.13-2.97-4.46zM13.8 3.84c.77-.93 1.29-2.22 1.15-3.51-1.11.05-2.45.74-3.24 1.66-.71.82-1.33 2.13-1.17 3.38 1.24.1 2.51-.63 3.26-1.53z" />
  </svg>
)

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState({})
  const [appNotice, setAppNotice] = useState('')

  useEffect(() => {
    let ignore = false
    fetchJson('/settings/public')
      .then((data) => {
        if (!ignore) setSocialLinks(data?.social && typeof data.social === 'object' ? data.social : {})
      })
      .catch(() => {
        if (!ignore) setSocialLinks({})
      })
    return () => {
      ignore = true
    }
  }, [])

  const visibleSocials = socialNetworks.filter((social) => socialLinks[social.key])

  return (
    <footer className="bg-gradient-to-b from-canvas via-panel to-canvas text-white">
      {/* Early order highlight */}
      <div className="border-b border-line bg-brand/10">
        <div className="container mx-auto px-6 py-3 text-center">
          <p className="text-sm font-semibold tracking-wide text-mint sm:text-base">
            Get your Tokriii before 7:00 AM
          </p>
        </div>
      </div>

      {/* Features bar */}
      <div className="border-b border-line">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-6 py-6 md:grid-cols-4 md:gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Leaf size={20} />
            </span>
            <p className="text-sm font-medium text-mint">Premium Quality Fruits</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Truck size={20} />
            </span>
            <p className="text-sm font-medium text-mint">60+ Premium Varieties</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Clock size={20} />
            </span>
            <p className="text-sm font-medium text-mint">Early Morning Delivery</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <ShieldCheck size={20} />
            </span>
            <p className="text-sm font-medium text-mint">100% Secure Payment</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="mb-5 block">
              <img
                src={tokriLogo}
                alt="tokriii - Selling Premium / Exotic Fruits"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <h3 className="text-lg font-bold text-white">TOKRIII</h3>
            <p className="mt-1 text-sm font-medium text-brand">Premium Fruits for Discerning Tastes</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Tokriii selling premium and exotic fruits — handpicked for quality, freshness, and flavour.
              From garden classics to rare tropical treasures, we bring the finest produce to your table.
            </p>

            <ul className="mt-5 space-y-3 text-sm text-mint">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>C 617 Azadpur Fruit Market, New Delhi 110033</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-brand" />
                <a href="mailto:support@tokriii.com" className="hover:text-white transition">
                  support@tokriii.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-brand" />
                <a href="tel:9580280280" className="hover:text-white transition">
                  9580280280
                </a>
                <span className="text-muted">/</span>
                <a href="tel:9958697427" className="hover:text-white transition">
                  9958697427
                </a>
              </li>
            </ul>

            {visibleSocials.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {visibleSocials.map((social) => (
                  <a
                    key={social.key}
                    href={socialLinks[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-panel-2 text-white shadow-sm transition hover:bg-brand hover:text-black hover:shadow-brand/20"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Our Range */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Our Range</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Garden & Tropical Fruits
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Berries, Grapes & Exotic Fruits
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Citrus, Dates & Juicy Fruits
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                60+ Premium Varieties Available
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link to="/about" className="transition hover:text-white">About us</Link></li>
              <li><Link to="/blog" className="transition hover:text-white">Blog</Link></li>
              <li><Link to="/help-faqs" className="transition hover:text-white">Help & FAQs</Link></li>
              <li><Link to="/returns-policy" className="transition hover:text-white">Returns Policy</Link></li>
              <li><Link to="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="transition hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="mb-4 text-base font-bold text-white">Download App</h4>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setAppNotice('Coming soon')}
                className="flex w-[70%] max-w-[200px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                <img src={playStoreIcon} alt="" className="h-6 w-6 shrink-0 object-contain" aria-hidden="true" />
                <span className="text-xs font-medium leading-tight">Get it on play store</span>
              </button>
              <button
                type="button"
                onClick={() => setAppNotice('Coming soon')}
                className="flex w-[70%] max-w-[200px] items-center gap-2 rounded-lg border-2 border-slate-900 bg-white px-3 py-2 text-left text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                <AppStoreIcon />
                <span className="text-xs font-medium leading-tight">Get it on app store</span>
              </button>
              {appNotice ? (
                <p className="text-sm font-medium text-mint" role="status">
                  {appNotice}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-line">
        <div className="container mx-auto px-6 py-5 text-center text-sm text-muted">
          © 2026 Tokriii. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
