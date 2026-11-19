/** Small hand-drawn bits from the website artboards. All decorative. */

export function PhoneGlyph() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#26121F"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function CameraSketch() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="40"
      height="30"
      viewBox="0 0 40 30"
      fill="none"
      stroke="#26121F"
      strokeWidth="2.2"
      strokeLinejoin="round"
    >
      <path d="M3 8 H12 L15 3 H25 L28 8 H37 V27 H3 Z" />
      <circle cx="20" cy="16.5" r="6" />
    </svg>
  );
}

export function MapPin() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="38"
      height="44"
      viewBox="0 0 36 40"
      fill="none"
      stroke="#26121F"
      strokeWidth="2.5"
      strokeLinejoin="round"
    >
      <path d="M18 37 C9 27 6 21 6 15 a12 12 0 0 1 24 0 C30 21 27 27 18 37 Z" fill="#C56CB0" />
      <circle cx="18" cy="15" r="4.5" fill="#FFFFFF" />
    </svg>
  );
}

/** Coloured bullet used in soup lists. */
export function ListDot({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{ flex: 'none' }}
    >
      <circle cx="11" cy="11" r="8.5" fill={color} stroke="#26121F" strokeWidth="2.5" />
    </svg>
  );
}

/** Separator dot on the hours ribbon. */
export function RibbonDot({ color, className }: { color: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      className={className}
    >
      <circle cx="9" cy="9" r="7" fill={color} stroke="#26121F" strokeWidth="2.5" />
    </svg>
  );
}

export function HandArrow() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="54"
      height="34"
      viewBox="0 0 54 34"
      style={{ flex: 'none' }}
    >
      <path
        d="M50 30 C34 34 12 28 8 10"
        fill="none"
        stroke="#F6E6F3"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M2 16 L8 7 L15 15"
        fill="none"
        stroke="#F6E6F3"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Bubbles floating around the logo in the hero. */
export function HeroBubbles({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 420 480" className={className}>
      <g stroke="#26121F" strokeWidth="3">
        <circle cx="40" cy="80" r="22" fill="#83EDF8" />
        <circle cx="33" cy="73" r="6" fill="#FFFFFF" stroke="none" />
        <circle cx="380" cy="60" r="15" fill="#B8E06A" />
        <circle cx="375" cy="55" r="4" fill="#FFFFFF" stroke="none" />
        <circle cx="400" cy="300" r="26" fill="#C56CB0" />
        <circle cx="392" cy="292" r="7" fill="#FFFFFF" stroke="none" />
        <circle cx="22" cy="380" r="13" fill="#B8E06A" />
        <circle cx="18" cy="376" r="3.5" fill="#FFFFFF" stroke="none" />
        <circle cx="350" cy="440" r="10" fill="#83EDF8" />
        <circle cx="70" cy="22" r="8" fill="#C56CB0" />
      </g>
    </svg>
  );
}

/** Green bubbles on the menu's soup sticker. */
export function SoupBubbles({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="92"
      height="84"
      viewBox="0 0 92 84"
      className={className}
    >
      <g stroke="#26121F" strokeWidth="3">
        <circle cx="24" cy="54" r="18" fill="#B8E06A" />
        <circle cx="18" cy="48" r="5" fill="#FFFFFF" stroke="none" />
        <circle cx="62" cy="30" r="13" fill="#8CC63F" />
        <circle cx="80" cy="66" r="8" fill="#B8E06A" />
      </g>
    </svg>
  );
}

export function Sun({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      className={className}
    >
      <g stroke="#26121F" strokeWidth="3" strokeLinecap="round">
        <path d="M32 4 V12 M32 52 V60 M4 32 H12 M52 32 H60 M12 12 L18 18 M46 46 L52 52 M52 12 L46 18 M12 52 L18 46" />
        <circle cx="32" cy="32" r="14" fill="#FFD23F" />
      </g>
    </svg>
  );
}

export function Heart({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="50"
      height="46"
      viewBox="0 0 50 46"
      className={className}
    >
      <path
        d="M25 42 C12 32 3 24 3 14 C3 7 8 3 14 3 C19 3 23 6 25 10 C27 6 31 3 36 3 C42 3 47 7 47 14 C47 24 38 32 25 42 Z"
        fill="#E32B2C"
        stroke="#26121F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M11 12 C11 9 13 8 15 8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Envelope for the private-events sticker (drawn to match the sun and heart). */
export function Envelope({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="58"
      height="44"
      viewBox="0 0 58 44"
      className={className}
    >
      <g stroke="#26121F" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="3" y="5" width="52" height="36" rx="5" fill="#FFF8EF" />
        <path d="M5 8 L29 26 L53 8" fill="none" />
        <circle cx="47" cy="11" r="7" fill="#E32B2C" />
      </g>
    </svg>
  );
}
