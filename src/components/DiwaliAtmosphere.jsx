'use client'

import { useSyncExternalStore } from 'react'
import { getDiwaliStatus } from '../lib/diwaliConfig'
import styles from './DiwaliAtmosphere.module.css'

const emptySubscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

function getClientSearchParams() {
  if (typeof window === 'undefined') return ''
  return window.location.search || ''
}

export default function DiwaliAtmosphere({ active, initialStatus = null }) {
  const mounted = useSyncExternalStore(emptySubscribe, clientSnapshot, serverSnapshot)
  const search = useSyncExternalStore(emptySubscribe, getClientSearchParams, () => '')

  let isActive = false
  if (typeof active === 'boolean') {
    isActive = active
  } else if (mounted && search) {
    const status = getDiwaliStatus({ searchParams: search })
    if (status.isOverride) {
      isActive = status.isActive
    } else if (initialStatus && typeof initialStatus.isActive === 'boolean') {
      isActive = initialStatus.isActive
    } else {
      isActive = status.isActive
    }
  } else if (initialStatus && typeof initialStatus.isActive === 'boolean') {
    isActive = initialStatus.isActive
  } else {
    isActive = getDiwaliStatus().isActive
  }

  if (!isActive) return null

  return (
    <div
      className={styles.atmosphereRoot}
      data-testid="diwali-atmosphere"
      aria-label="Happy Diwali celebration"
    >
      {/* ====================================================================
          1. Full-Viewport Atmospheric Layer (Illuminates Left & Right Voids)
          ==================================================================== */}
      <div className={styles.ambientBackdrop} aria-hidden="true">
        {/* Soft Golden Ambient Light Wash */}
        <div className={styles.ambientWash} />

        {/* Left Side: Hanging Traditional Brass Diya + Rangoli Filigree */}
        <div className={styles.leftWing}>
          <svg
            className={styles.wingSvg}
            viewBox="0 0 380 480"
            preserveAspectRatio="xMinYMin meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="leftBrassGrad" x1="50" y1="90" x2="120" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF3D1" />
                <stop offset="25%" stopColor="#E9C77A" />
                <stop offset="60%" stopColor="#C59A45" />
                <stop offset="100%" stopColor="#6B4E0E" />
              </linearGradient>

              <radialGradient id="leftFlameHalo" cx="85" cy="85" r="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F2A84A" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#E9C77A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0A110A" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="leftFlameGrad" x1="85" y1="50" x2="85" y2="105" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="20%" stopColor="#FFF59D" />
                <stop offset="55%" stopColor="#FF9800" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
            </defs>

            {/* Ambient Diya Halo */}
            <circle cx="85" cy="88" r="50" fill="url(#leftFlameHalo)" className={styles.hangingHalo} />

            {/* Hanging Decorative Brass Chain */}
            <line x1="85" y1="0" x2="85" y2="70" stroke="#D4A745" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="85" cy="20" r="2.5" fill="#E9C77A" />
            <circle cx="85" cy="45" r="2.5" fill="#E9C77A" />
            <circle cx="85" cy="68" r="4" fill="#D4A745" />

            {/* Decorative Hanging Bell / Cap */}
            <path d="M75 74 C75 67 95 67 95 74 L97 80 C97 82 73 82 73 80 Z" fill="#E9C77A" />

            {/* Multi-tier Hanging Brass Diya Lamp */}
            <ellipse cx="85" cy="115" rx="32" ry="10" fill="url(#leftBrassGrad)" />
            <path
              d="M53 115 C53 135 72 148 85 148 C98 148 117 135 117 115 C117 112 110 110 85 110 C60 110 53 112 53 115 Z"
              fill="url(#leftBrassGrad)"
            />
            {/* Hanging Bell Tassel beneath diya */}
            <path d="M82 148 L88 148 L86 162 L84 162 Z" fill="#C59A45" />
            <circle cx="85" cy="164" r="3" fill="#E9C77A" />

            {/* Molten Oil Layer */}
            <ellipse cx="85" cy="113" rx="26" ry="6.5" fill="#FFB74D" opacity="0.85" />

            {/* Burning Wick */}
            <path d="M85 110 Q85 102 83.5 96" stroke="#3E2723" strokeWidth="1.6" strokeLinecap="round" />

            {/* Animated Living Flame */}
            <g className={styles.hangingDiyaFlame}>
              <path
                d="M85 52 C90 68 94 85 91 93 C88 99 82 99 79 93 C76 85 80 68 85 52 Z"
                fill="url(#leftFlameGrad)"
              />
              <path
                d="M85 64 C87.5 74 89 83 87.5 87 C86 90 84 90 82.5 87 C81 83 82.5 74 85 64 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>

            {/* Delicate Rangoli & Botanical Filigree (Soft Champagne Gold 0.8px linework) */}
            <g stroke="#E9C77A" strokeWidth="0.85" fill="none" opacity="0.22">
              {/* Concentric ornamental mandala arcs */}
              <circle cx="0" cy="240" r="70" />
              <circle cx="0" cy="240" r="110" strokeDasharray="2 4" />
              <circle cx="0" cy="240" r="150" />
              <circle cx="0" cy="240" r="190" strokeDasharray="3 5" />
              <circle cx="0" cy="240" r="230" />

              {/* Graceful curving lotus petals */}
              <path d="M0 170 C40 170 70 200 70 240 C70 280 40 310 0 310" />
              <path d="M0 130 C60 130 110 180 110 240 C110 300 60 350 0 350" />
              <path d="M0 90 C80 90 150 150 150 240 C150 330 80 390 0 390" />

              {/* Paisley floral flourishes */}
              <path d="M70 240 Q130 190 160 220 T210 240" />
              <path d="M70 240 Q130 290 160 260 T210 240" />
              <path d="M110 240 Q170 170 220 200 T260 230" />
              <path d="M110 240 Q170 310 220 280 T260 250" />
            </g>

            {/* Warm floating starlight points */}
            <g className={styles.wingStar}>
              <path d="M165 85 L167 92 L174 94 L167 96 L165 103 L163 96 L156 94 L163 92 Z" fill="#FFEBB8" />
            </g>
            <g className={styles.wingStarDelay1}>
              <path d="M130 220 L132 226 L138 228 L132 230 L130 236 L128 230 L122 228 L128 226 Z" fill="#E9C77A" />
            </g>
            <g className={styles.wingStarDelay2}>
              <path d="M220 320 L222 327 L229 329 L222 331 L220 338 L218 331 L211 329 L218 327 Z" fill="#F2A84A" />
            </g>
          </svg>
        </div>

        {/* Right Side: Celestial Lotus Diya + Radiating Floral Arch */}
        <div className={styles.rightWing}>
          <svg
            className={styles.wingSvg}
            viewBox="0 0 380 480"
            preserveAspectRatio="xMaxYMin meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="rightBrassGrad" x1="220" y1="120" x2="300" y2="185" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF3D1" />
                <stop offset="30%" stopColor="#E9C77A" />
                <stop offset="70%" stopColor="#C59A45" />
                <stop offset="100%" stopColor="#6B4E0E" />
              </linearGradient>

              <radialGradient id="rightFlameHalo" cx="260" cy="120" r="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F2A84A" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#E9C77A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0A110A" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="rightFlameGrad" x1="260" y1="75" x2="260" y2="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#FFF59D" />
                <stop offset="60%" stopColor="#FF9800" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
            </defs>

            {/* Ambient Halo */}
            <circle cx="260" cy="125" r="54" fill="url(#rightFlameHalo)" className={styles.rightHalo} />

            {/* Lotus Pedestal Base */}
            <path
              d="M225 170 C235 155 245 158 260 162 C275 158 285 155 295 170 C280 178 240 178 225 170 Z"
              fill="url(#rightBrassGrad)"
            />
            {/* Outspread Lotus Petals beneath pedestal */}
            <path
              d="M210 172 Q225 160 240 168 Q260 152 280 168 Q295 160 310 172 Q260 186 210 172 Z"
              fill="#8A6514"
              opacity="0.85"
            />

            {/* Elevated Royal Diya Bowl */}
            <ellipse cx="260" cy="148" rx="28" ry="9" fill="url(#rightBrassGrad)" />
            <path
              d="M232 148 C232 165 248 174 260 174 C272 174 288 165 288 148 Z"
              fill="url(#rightBrassGrad)"
            />
            {/* Oil reflection */}
            <ellipse cx="260" cy="146.5" rx="22" ry="5.5" fill="#FFB74D" opacity="0.9" />

            {/* Wick */}
            <path d="M260 144 Q260 137 258.5 131" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" />

            {/* Animated Living Flame */}
            <g className={styles.rightDiyaFlame}>
              <path
                d="M260 85 C265 101 269 118 266 126 C263 132 257 132 254 126 C251 118 255 101 260 85 Z"
                fill="url(#rightFlameGrad)"
              />
              <path
                d="M260 97 C262.5 107 264 116 262.5 120 C261 123 259 123 257.5 120 C256 116 257.5 107 260 97 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>

            {/* Radiating Celestial Lotus Arch & Starburst Linework */}
            <g stroke="#E9C77A" strokeWidth="0.85" fill="none" opacity="0.22">
              <circle cx="380" cy="220" r="70" />
              <circle cx="380" cy="220" r="120" strokeDasharray="3 4" />
              <circle cx="380" cy="220" r="170" />
              <circle cx="380" cy="220" r="220" strokeDasharray="4 6" />
              <circle cx="380" cy="220" r="270" />

              {/* Arching floral petals */}
              <path d="M380 140 C330 140 290 180 290 220 C290 260 330 300 380 300" />
              <path d="M380 90 C300 90 240 150 240 220 C240 290 300 350 380 350" />
              <path d="M380 40 C270 40 190 120 190 220 C190 320 270 400 380 400" />

              {/* Radiating floral sweeps */}
              <path d="M290 220 Q220 170 170 200 T120 220" />
              <path d="M290 220 Q220 270 170 240 T120 220" />
            </g>

            {/* Asymmetric Twinkle Stars */}
            <g className={styles.wingStar}>
              <path d="M185 90 L187 97 L194 99 L187 101 L185 108 L183 101 L176 99 L183 97 Z" fill="#FFEAA7" />
            </g>
            <g className={styles.wingStarDelay1}>
              <path d="M230 270 L232 277 L239 279 L232 281 L230 288 L228 281 L221 279 L228 277 Z" fill="#E9C77A" />
            </g>
            <g className={styles.wingStarDelay2}>
              <path d="M140 190 L142 196 L148 198 L142 200 L140 206 L138 200 L132 198 L138 196 Z" fill="#F2A84A" />
            </g>
            <g className={styles.wingStarDelay3}>
              <path d="M310 340 L312 347 L319 349 L312 351 L310 358 L308 351 L301 349 L308 347 Z" fill="#FFF3D1" />
            </g>
          </svg>
        </div>
      </div>

      {/* ====================================================================
          2. Centered Luxury Festive Greeting Card (Integrated with Hero)
          ==================================================================== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <aside className={styles.greetingCard} aria-label="Happy Diwali celebration banner">
          <div className={styles.cardHairline} aria-hidden="true" />

          <div className={styles.cardInner}>
            {/* Left Focal Group: Sitting Royal Brass Diya + Typography */}
            <div className={styles.focalGroup}>
              {/* Royal Diya Illustration */}
              <div className={styles.centerDiyaBox} aria-hidden="true">
                <div className={styles.flameHalo} />
                <svg
                  viewBox="0 0 54 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.diyaSvg}
                  role="img"
                  aria-label="Golden Diya"
                >
                  <defs>
                    <linearGradient id="centerDiyaBrass" x1="6" y1="24" x2="48" y2="44" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFF3D1" />
                      <stop offset="25%" stopColor="#E9C77A" />
                      <stop offset="60%" stopColor="#C59A45" />
                      <stop offset="100%" stopColor="#5C420B" />
                    </linearGradient>

                    <linearGradient id="centerDiyaOil" x1="8" y1="23" x2="46" y2="31" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFD54F" />
                      <stop offset="45%" stopColor="#FF9800" />
                      <stop offset="100%" stopColor="#E65100" />
                    </linearGradient>

                    <linearGradient id="centerFlameOuter" x1="27" y1="4" x2="27" y2="24" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFF9C4" />
                      <stop offset="25%" stopColor="#FFD54F" />
                      <stop offset="60%" stopColor="#FF9800" />
                      <stop offset="100%" stopColor="#E65100" />
                    </linearGradient>

                    <linearGradient id="centerFlameCore" x1="27" y1="8" x2="27" y2="20" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="50%" stopColor="#FFFDE7" />
                      <stop offset="100%" stopColor="#FFF59D" />
                    </linearGradient>
                  </defs>

                  {/* Pedestal Foot */}
                  <ellipse cx="27" cy="43" rx="9" ry="3" fill="#6B4E0E" />
                  <ellipse cx="27" cy="42" rx="8" ry="2.5" fill="#8A6514" />

                  {/* Royal Clay/Brass Bowl */}
                  <path
                    d="M6 26.5 C6 37 15 42 27 42 C39 42 48 37 48 26.5 C48 23.5 42 24.5 27 24.5 C12 24.5 6 23.5 6 26.5 Z"
                    fill="url(#centerDiyaBrass)"
                  />

                  {/* Specular Highlight Contour */}
                  <path
                    d="M10 29.5 C14.5 35.5 20 38.5 27 38.5 C34 38.5 39.5 35.5 44 29.5"
                    stroke="#FFE8A3"
                    strokeWidth="1"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.65"
                  />

                  {/* Oil Layer */}
                  <ellipse cx="27" cy="26" rx="18.5" ry="4" fill="url(#centerDiyaOil)" opacity="0.92" />

                  {/* Burning Wick */}
                  <path d="M27 24.5 Q27 22.5 26.5 20" stroke="#3E2723" strokeWidth="1.6" strokeLinecap="round" />

                  {/* Living Flickering Flame */}
                  <g className={`${styles.flameFlicker} ${styles.flameElement}`}>
                    <path
                      d="M27 4 C31 10 34 16 32 20.5 C30 24.5 24 24.5 22 20.5 C20 16 23 10 27 4 Z"
                      fill="url(#centerFlameOuter)"
                    />
                    <path
                      d="M27 8 C29 12 30.5 15.5 29.5 18.5 C28.5 21 25.5 21 24.5 18.5 C23.5 15.5 25 12 27 8 Z"
                      fill="url(#centerFlameCore)"
                      opacity="0.95"
                    />
                  </g>
                </svg>
              </div>

              {/* Typography */}
              <div className={styles.textColumn}>
                <div className={styles.eyebrowBadge}>
                  <span>✦</span> Festival of Lights <span>✦</span>
                </div>
                <h2 className={styles.primaryGreeting}>Happy Diwali from Tokriii</h2>
                <p className={styles.supportingTagline}>
                  A season of light. A little more freshness in every celebration.
                </p>
              </div>
            </div>

            {/* Right Flourish: Starburst & Ambient Sparkles */}
            <div className={styles.cardFlourish} aria-hidden="true">
              <svg
                className={styles.flourishSvg}
                viewBox="0 0 58 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Central 8-pointed star */}
                <g className={styles.cardTwinkle1}>
                  <path
                    d="M29 6 L31.5 14.5 L40 17 L31.5 19.5 L29 28 L26.5 19.5 L18 17 L26.5 14.5 Z"
                    fill="#FFF3D1"
                  />
                </g>
                {/* Supporting small stars */}
                <g className={styles.cardTwinkle2}>
                  <path d="M12 12 L13 15 L16 16 L13 17 L12 20 L11 17 L8 16 L11 15 Z" fill="#E9C77A" />
                  <path d="M46 20 L47 23 L50 24 L47 25 L46 28 L45 25 L42 24 L45 23 Z" fill="#F2A84A" />
                </g>
              </svg>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
