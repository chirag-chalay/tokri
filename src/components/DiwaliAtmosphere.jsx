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
  // Safe client-side check to enable interactive preview without SSR mismatch
  const mounted = useSyncExternalStore(emptySubscribe, clientSnapshot, serverSnapshot)
  const search = useSyncExternalStore(emptySubscribe, getClientSearchParams, () => '')

  // Priority:
  // 1. Explicit boolean prop if passed
  // 2. Client query-param override if mounted (allows instant ?diwali=preview testing)
  // 3. initialStatus passed from SSR / server
  // 4. Default schedule check
  let isActive = false
  if (typeof active === 'boolean') {
    isActive = active
  } else if (mounted && search) {
    const status = getDiwaliStatus({ searchParams: search })
    isActive = status.isActive
  } else if (initialStatus && typeof initialStatus.isActive === 'boolean') {
    isActive = initialStatus.isActive
  } else {
    isActive = getDiwaliStatus().isActive
  }

  if (!isActive) return null

  return (
    <aside
      className={styles.diwaliAtmosphere}
      aria-label="Happy Diwali celebration banner"
      data-testid="diwali-atmosphere"
    >
      <div className={styles.bannerWrapper}>
        <div className={styles.hairline} aria-hidden="true" />

        {/* Left: Diya illustration & Festive Greetings */}
        <div className={styles.leftGroup}>
          <div className={styles.diyaContainer} aria-hidden="true">
            <div className={styles.haloGlow} />
            <svg
              viewBox="0 0 48 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.diyaSvg}
              role="img"
              aria-label="Golden Diya"
            >
              <defs>
                {/* Diya Clay / Brass metallic gradient */}
                <linearGradient id="diyaBodyGrad" x1="5" y1="21" x2="43" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E9C77A" />
                  <stop offset="25%" stopColor="#D4A745" />
                  <stop offset="65%" stopColor="#8A6514" />
                  <stop offset="100%" stopColor="#5C420B" />
                </linearGradient>

                {/* Inner reservoir / molten oil reflection */}
                <linearGradient id="diyaOilGrad" x1="7" y1="20" x2="41" y2="27" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFD54F" />
                  <stop offset="45%" stopColor="#FF9800" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>

                {/* Outer flame gradient */}
                <linearGradient id="flameOuterGrad" x1="24" y1="3" x2="24" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF9C4" />
                  <stop offset="25%" stopColor="#FFD54F" />
                  <stop offset="60%" stopColor="#FF9800" />
                  <stop offset="100%" stopColor="#E65100" />
                </linearGradient>

                {/* Core luminous flame */}
                <linearGradient id="flameInnerGrad" x1="24" y1="6" x2="24" y2="18" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#FFFDE7" />
                  <stop offset="100%" stopColor="#FFF59D" />
                </linearGradient>
              </defs>

              {/* Diya Stand / Foot */}
              <ellipse cx="24" cy="38" rx="7.5" ry="2.5" fill="#6B4E0E" />
              <ellipse cx="24" cy="37.5" rx="7" ry="2" fill="#8A6514" />

              {/* Diya Clay Bowl */}
              <path
                d="M5 23.5 C5 33 13 37.5 24 37.5 C35 37.5 43 33 43 23.5 C43 21 38 21.8 24 21.8 C10 21.8 5 21 5 23.5 Z"
                fill="url(#diyaBodyGrad)"
              />

              {/* Delicate specular curve highlight */}
              <path
                d="M8.5 26.5 C12.5 32 17.5 34.5 24 34.5 C30.5 34.5 35.5 32 39.5 26.5"
                stroke="#FFE8A3"
                strokeWidth="0.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />

              {/* Oil rim surface */}
              <ellipse cx="24" cy="23.2" rx="16.5" ry="3.6" fill="url(#diyaOilGrad)" opacity="0.9" />

              {/* Burning wick */}
              <path
                d="M24 22 Q24 20 23.6 18"
                stroke="#3E2723"
                strokeWidth="1.4"
                strokeLinecap="round"
              />

              {/* Animated Flame (Outer + Inner Core) */}
              <g className={styles.flameElement}>
                {/* Outer warm teardrop flame */}
                <path
                  d="M24 3 C27.5 8.5 30 13.5 28.5 17.5 C27 21 21 21 19.5 17.5 C18 13.5 20.5 8.5 24 3 Z"
                  fill="url(#flameOuterGrad)"
                />
                {/* Inner white-hot luminous core */}
                <path
                  d="M24 6.5 C25.8 10 27.2 13 26.2 15.8 C25.2 18 22.8 18 21.8 15.8 C20.8 13 22.2 10 24 6.5 Z"
                  fill="url(#flameInnerGrad)"
                  opacity="0.95"
                />
              </g>
            </svg>
          </div>

          {/* Typography */}
          <div className={styles.textGroup}>
            <div className={styles.headingRow}>
              <span className={styles.greetingText}>Happy Diwali from Tokriii</span>
              <span className={styles.festiveTag}>
                <span aria-hidden="true">✦</span> Festival of Lights
              </span>
            </div>
            <p className={styles.supportingText}>
              A season of light. A little more freshness in every celebration.
            </p>
          </div>
        </div>

        {/* Right: Golden Twinkle Starlight points */}
        <div className={styles.twinkleField} aria-hidden="true">
          {/* Star 1 */}
          <svg className={`${styles.star} ${styles.star1}`} viewBox="0 0 24 24" fill="none">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#FFEAA7" />
          </svg>
          {/* Star 2 */}
          <svg className={`${styles.star} ${styles.star2}`} viewBox="0 0 24 24" fill="none">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#E9C77A" />
          </svg>
          {/* Star 3 */}
          <svg className={`${styles.star} ${styles.star3}`} viewBox="0 0 24 24" fill="none">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#F2A84A" />
          </svg>
          {/* Star 4 */}
          <svg className={`${styles.star} ${styles.star4}`} viewBox="0 0 24 24" fill="none">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#FFF3D1" />
          </svg>
        </div>
      </div>
    </aside>
  )
}
