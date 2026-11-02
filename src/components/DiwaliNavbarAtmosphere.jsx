'use client'

import { useSyncExternalStore } from 'react'
import { getDiwaliStatus } from '../lib/diwaliConfig'
import styles from './DiwaliNavbarAtmosphere.module.css'

const emptySubscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

function getClientSearchParams() {
  if (typeof window === 'undefined') return ''
  return window.location.search || ''
}

export default function DiwaliNavbarAtmosphere({ active, initialStatus = null }) {
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
      className={styles.navbarAtmosphereRoot}
      data-testid="diwali-navbar-atmosphere"
      data-testid-legacy="diwali-atmosphere"
      aria-hidden="true"
    >
      {/* Global Shared SVG Gradients (Available to Desktop and Mobile) */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <linearGradient id="navBrassLeft" x1="4" y1="18" x2="40" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF3D1" />
            <stop offset="25%" stopColor="#E9C77A" />
            <stop offset="60%" stopColor="#C59A45" />
            <stop offset="100%" stopColor="#5C420B" />
          </linearGradient>

          <linearGradient id="navBrassRight" x1="8" y1="16" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF3D1" />
            <stop offset="30%" stopColor="#E9C77A" />
            <stop offset="70%" stopColor="#C59A45" />
            <stop offset="100%" stopColor="#6B4E0E" />
          </linearGradient>

          <linearGradient id="navOil" x1="6" y1="19" x2="38" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="45%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          <linearGradient id="navFlameOuter" x1="22" y1="2" x2="22" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="25%" stopColor="#FFD54F" />
            <stop offset="60%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          <linearGradient id="navFlameCore" x1="22" y1="5" x2="22" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFFDE7" />
            <stop offset="100%" stopColor="#FFF59D" />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. Ambient Golden Illumination Wash across Full Viewport */}
      <div className={styles.ambientWash} />

      {/* 2. Outer Left Corner Hanging Festive Lights (Desktop) */}
      <div className={styles.cornerHangingLeft}>
        <svg className={styles.hangingSvg} viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="0" x2="12" y2="28" stroke="#D4A745" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="12" cy="30" r="2.5" fill="#FFEBB8" className={styles.bulbTwinkle1} />
          <path d="M9.5 32 L14.5 32 L12 40 Z" fill="#E9C77A" />

          <line x1="28" y1="0" x2="28" y2="44" stroke="#D4A745" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="28" cy="46" r="3.2" fill="#FFF3D1" className={styles.bulbTwinkle2} />
          <path d="M25 49 L31 49 L28 58 Z" fill="#C59A45" />

          <line x1="42" y1="0" x2="42" y2="20" stroke="#D4A745" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="42" cy="22" r="2.2" fill="#FFEBB8" className={styles.bulbTwinkle3} />
        </svg>
      </div>

      {/* 3. Outer Right Corner Hanging Festive Lights (Desktop) */}
      <div className={styles.cornerHangingRight}>
        <svg className={styles.hangingSvg} viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="10" y1="0" x2="10" y2="22" stroke="#D4A745" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="10" cy="24" r="2.2" fill="#FFEBB8" className={styles.bulbTwinkle3} />

          <line x1="24" y1="0" x2="24" y2="44" stroke="#D4A745" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="24" cy="46" r="3.2" fill="#FFF3D1" className={styles.bulbTwinkle2} />
          <path d="M21 49 L27 49 L24 58 Z" fill="#C59A45" />

          <line x1="40" y1="0" x2="40" y2="28" stroke="#D4A745" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="40" cy="30" r="2.5" fill="#FFEBB8" className={styles.bulbTwinkle1} />
          <path d="M37.5 32 L42.5 32 L40 40 Z" fill="#E9C77A" />
        </svg>
      </div>

      {/* 4. Desktop Outer Left Glowing Diya (Asymmetric) */}
      <div className={styles.desktopLeftDiya}>
        <div className={styles.flameHalo} />
        <svg
          className={styles.diyaSvg}
          viewBox="0 0 44 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Golden Diya"
        >
          {/* Diya Base Foot */}
          <ellipse cx="22" cy="35" rx="7" ry="2" fill="#6B4E0E" />

          {/* Traditional Brass Diya Bowl */}
          <path
            d="M5 21 C5 30 13 35 22 35 C31 35 39 30 39 21 C39 18 34 19 22 19 C10 19 5 18 5 21 Z"
            fill="url(#navBrassLeft)"
          />

          {/* Specular Rim Contour */}
          <path
            d="M8 24 C12 28 17 31 22 31 C27 31 32 28 36 24"
            stroke="#FFE8A3"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />

          {/* Molten Oil Reservoir */}
          <ellipse cx="22" cy="20.5" rx="14.5" ry="3" fill="url(#navOil)" opacity="0.9" />

          {/* Burning Wick */}
          <path d="M22 19.5 Q22 17.5 21.5 15.5" stroke="#3E2723" strokeWidth="1.4" strokeLinecap="round" />

          {/* Living Animated Flame */}
          <g className={`${styles.flameFlicker} ${styles.flameElement}`}>
            <path
              d="M22 2 C25.5 7.5 28 12.5 26.5 16.5 C25 19.5 19 19.5 17.5 16.5 C16 12.5 18.5 7.5 22 2 Z"
              fill="url(#navFlameOuter)"
            />
            <path
              d="M22 5.5 C24 9 25 12 24 14.5 C23 16.5 21 16.5 20 14.5 C19 12 20 9 22 5.5 Z"
              fill="url(#navFlameCore)"
              opacity="0.95"
            />
          </g>
        </svg>
      </div>

      {/* 5. Desktop Outer Right Lotus Diya (Asymmetric) */}
      <div className={styles.desktopRightDiya}>
        <div className={styles.rightFlameHalo} />
        <svg
          className={styles.diyaSvg}
          viewBox="0 0 44 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Lotus Diya"
        >
          {/* Outspread Lotus Petals */}
          <path
            d="M9 33 Q15 27 22 30 Q29 27 35 33 Q22 37 9 33 Z"
            fill="#8A6514"
            opacity="0.85"
          />

          {/* Elevated Royal Bowl */}
          <ellipse cx="22" cy="24" rx="14" ry="5" fill="url(#navBrassRight)" />
          <path
            d="M10 24 C10 31 16 34 22 34 C28 34 34 31 34 24 Z"
            fill="url(#navBrassRight)"
          />

          {/* Oil Reflection */}
          <ellipse cx="22" cy="22.5" rx="11" ry="3" fill="url(#navOil)" opacity="0.9" />

          {/* Wick */}
          <path d="M22 21.5 Q22 19 21.5 16.5" stroke="#3E2723" strokeWidth="1.3" strokeLinecap="round" />

          {/* Living Flame */}
          <g className={styles.rightDiyaFlame}>
            <path
              d="M22 3.5 C25.5 8.5 27.5 13 26 16.5 C24.5 19.5 19.5 19.5 18 16.5 C16.5 13 18.5 8.5 22 3.5 Z"
              fill="url(#navFlameOuter)"
            />
            <path
              d="M22 6.5 C23.8 10 24.5 12.5 23.5 15 C22.8 16.5 21.2 16.5 20.5 15 C19.5 12.5 20.2 10 22 6.5 Z"
              fill="url(#navFlameCore)"
              opacity="0.95"
            />
          </g>
        </svg>
      </div>

      {/* 6. Mobile Optimized Atmosphere Layer (< 1024px) */}
      <div className={styles.mobileNavbarAtmosphere}>
        {/* Miniature Glowing Diya gracefully positioned in open space */}
        <div className={styles.mobileMiniDiya}>
          <div className={styles.mobileFlameHalo} />
          <svg viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 14 C3 19 7.5 22 13 22 C18.5 22 23 19 23 14 C23 12.5 19.5 13 13 13 C6.5 13 3 12.5 3 14 Z"
              fill="url(#navBrassLeft)"
            />
            <ellipse cx="13" cy="13.5" rx="8" ry="2" fill="url(#navOil)" />
            <path d="M13 13 L12.5 10.5" stroke="#3E2723" strokeWidth="1.1" strokeLinecap="round" />
            <g className={styles.mobileDiyaFlame}>
              <path
                d="M13 2 C15 5.5 16.5 8.5 15.5 11 C14.5 12.5 11.5 12.5 10.5 11 C9.5 8.5 11 5.5 13 2 Z"
                fill="url(#navFlameOuter)"
              />
              <path
                d="M13 4 C14 6.2 14.8 8 14.2 9.5 C13.6 10.5 12.4 10.5 11.8 9.5 C11.2 8 12 6.2 13 4 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* 7. Floating Twinkle Sparkles in Safe Zones */}
      <div className={styles.sparklesLayer}>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className={styles.hangingSvg}>
          <g className={styles.twinkle1}>
            <path d="M70 20 L71.5 24 L75.5 25.5 L71.5 27 L70 31 L68.5 27 L64.5 25.5 L68.5 24 Z" fill="#FFF3D1" />
          </g>
          <g className={styles.twinkle2}>
            <path d="M210 12 L211 15 L214 16 L211 17 L210 20 L209 17 L206 16 L209 15 Z" fill="#E9C77A" />
          </g>
          <g className={styles.twinkle3}>
            <path d="M990 14 L991 17 L994 18 L991 19 L990 22 L989 19 L986 18 L989 17 Z" fill="#E9C77A" />
          </g>
          <g className={styles.twinkle4}>
            <path d="M1130 20 L1131.5 24 L1135.5 25.5 L1131.5 27 L1130 31 L1128.5 27 L1124.5 25.5 L1128.5 24 Z" fill="#FFF3D1" />
          </g>
        </svg>
      </div>

      {/* 8. Bottom Golden Glowing Hairline & Light Sweep */}
      <div className={styles.bottomHairline}>
        <div className={styles.bottomShimmer} />
      </div>
    </div>
  )
}
