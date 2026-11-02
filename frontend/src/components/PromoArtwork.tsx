import { useId } from 'react';

export function PromoArtwork({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      viewBox="0 0 560 320"
      className={className}
      role="img"
      aria-label="Purelis toner, moisturizer and SPF arranged with green leaves"
    >
      <defs>
        <linearGradient id={`promoBottle${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#819878" />
          <stop offset="50%" stopColor="#C4D1B7" />
          <stop offset="100%" stopColor="#667D5B" />
        </linearGradient>
        <linearGradient id={`promoAmber${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B08A66" />
          <stop offset="50%" stopColor="#D9BE98" />
          <stop offset="100%" stopColor="#94704D" />
        </linearGradient>
        <radialGradient id={`promoShadow${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#27391F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#27391F" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g opacity="0.57" fill="none" stroke="#536F43" strokeWidth="2.4">
        <path d="M37 277C73 242 95 212 131 203" />
        <path d="M66 247c-17 2-33-6-42-21 17-5 34 1 45 15" fill="#769062" stroke="none" />
        <path d="M89 225c-12-12-15-30-7-45 13 10 19 27 13 43" fill="#8FA47D" stroke="none" />
        <path d="M525 106c-22 32-26 66-15 102" />
        <path d="M521 149c14-14 19-34 12-52-15 10-22 30-18 49" fill="#769062" stroke="none" />
        <path d="M514 192c17-4 31-16 37-32-18-1-34 9-42 25" fill="#8FA47D" stroke="none" />
      </g>

      <ellipse cx="281" cy="276" rx="226" ry="28" fill={`url(#promoShadow${id})`} />

      <g transform="translate(147 42) rotate(-9 60 115)">
        <rect x="36" y="0" width="48" height="28" rx="7" fill="#2E4A26" />
        <rect x="46" y="23" width="28" height="16" fill="#557148" />
        <path d="M13 39h94v168c0 18-14 32-32 32H45c-18 0-32-14-32-32V39Z" fill={`url(#promoBottle${id})`} />
        <rect x="24" y="78" width="72" height="104" fill="#FAF7EE" opacity="0.96" />
        <text x="60" y="108" textAnchor="middle" fill="#2F4828" fontSize="12" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="2">PURELIS</text>
        <line x1="37" y1="119" x2="83" y2="119" stroke="#2F4828" strokeWidth="0.8" opacity="0.4" />
        <text x="60" y="136" textAnchor="middle" fill="#2F4828" fontSize="5.5" fontFamily="Montserrat, sans-serif" letterSpacing="1.2">BALANCING TONER</text>
        <path d="M43 159h34" stroke="#557148" strokeWidth="0.9" opacity="0.4" />
        <path d="M24 89v78" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.17" />
      </g>

      <g transform="translate(315 151) rotate(5 82 55)">
        <rect x="8" y="0" width="150" height="37" rx="12" fill="#36532C" />
        <rect x="19" y="7" width="128" height="8" rx="4" fill="#FFFFFF" opacity="0.12" />
        <path d="M14 35h138v56c0 20-16 36-36 36H50c-20 0-36-16-36-36V35Z" fill={`url(#promoAmber${id})`} />
        <rect x="28" y="58" width="110" height="43" fill="#FAF6EB" opacity="0.95" />
        <text x="83" y="77" textAnchor="middle" fill="#354A2D" fontSize="9.5" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="1.7">PURELIS</text>
        <text x="83" y="90" textAnchor="middle" fill="#354A2D" fontSize="4.8" fontFamily="Montserrat, sans-serif" letterSpacing="1.1">HYDRA BARRIER CREAM</text>
      </g>

      <g transform="translate(403 58) rotate(12 43 104)">
        <rect x="28" y="0" width="51" height="25" rx="8" fill="#C57D5E" />
        <path d="M12 24h84v167c0 20-16 36-36 36h-12c-20 0-36-16-36-36V24Z" fill="#E9D5BE" />
        <path d="M12 24h84v55H12z" fill="#DBA48B" />
        <rect x="21" y="89" width="66" height="82" rx="10" fill="#FFF9EF" opacity="0.96" />
        <circle cx="54" cy="110" r="9" fill="none" stroke="#9C634C" strokeWidth="1" opacity="0.7" />
        <path d="M54 104v-3M54 119v-3M48 110h-3M63 110h-3M50 106l-2-2M60 116l-2-2M58 106l2-2M50 114l-2 2" stroke="#9C634C" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <text x="54" y="136" textAnchor="middle" fill="#7A4C3A" fontSize="7.5" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="1.2">PURELIS</text>
        <text x="54" y="149" textAnchor="middle" fill="#7A4C3A" fontSize="4.8" fontFamily="Montserrat, sans-serif" letterSpacing="1">DAILY SPF 50</text>
      </g>

      <g transform="translate(97 257)">
        <path d="M0 0c-17-7-28-22-28-41 20 3 34 17 37 36" fill="#4D6B3D" />
        <path d="M4 2C14-10 31-15 47-8 40 7 24 14 7 10" fill="#789168" />
        <path d="M-4 3c-12 10-29 13-43 5 9-12 26-16 41-9" fill="#5E7F4A" />
      </g>

      <circle cx="255" cy="62" r="3.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="333" cy="35" r="2.3" fill="#FFFFFF" opacity="0.48" />
      <circle cx="515" cy="244" r="2.8" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}
