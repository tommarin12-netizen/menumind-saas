'use client'
import { useRef, MouseEvent } from 'react'

export type IconAnim = 'float' | 'pulse' | 'spin' | 'bounce' | 'wiggle' | 'none'

interface Props {
  children: string
  /** taille en px ou string CSS (ex: "1.4em") */
  size?: number | string
  /** animation idle */
  anim?: IconAnim
  className?: string
  style?: React.CSSProperties
}

/**
 * Icon3D — enveloppe un emoji avec :
 *  • animation idle (float, pulse, spin, bounce, wiggle)
 *  • tilt 3D dynamique basé sur la position de la souris
 *  • drop-shadow pour la profondeur
 */
export default function Icon3D({ children, size, anim = 'float', className = '', style }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  function handleMouseMove(e: MouseEvent<HTMLSpanElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 2   // -1 → 1
    const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2  // -1 → 1
    const rx = -dy * 22
    const ry =  dx * 22
    const sx = -dx * 5
    const sy =  dy * 3
    el.style.transform = `perspective(180px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.32) translateY(-5px)`
    el.style.filter    = `drop-shadow(${sx}px ${8 + sy}px 14px rgba(0,0,0,.28)) brightness(1.12)`
    el.style.animationPlayState = 'paused'
  }

  function handleMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.filter    = ''
    el.style.animationPlayState = ''
  }

  return (
    <span
      ref={ref}
      className={`icon3d icon3d-${anim} ${className}`}
      style={{ fontSize: size, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
