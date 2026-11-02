import { useId } from 'react';

export function HeroArtwork({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      viewBox="0 0 640 470"
      className={className}
      role="img"
      aria-label="Purelis cleanser, serum and moisturizer arranged on a stone plinth with botanicals"
    >
      <defs>
        <linearGradient id={`heroLeaf${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6F8A5A" />
          <stop offset="100%" stopColor="#3F5E30" />
        </linearGradient>
        <linearGradient id={`heroGlass${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#738C67" />
          <stop offset="52%" stopColor="#BCCCAE" />
          <stop offset="100%" stopColor="#506A44" />
        </linearGradient>
        <linearGradient id={`heroAmber${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A47F56" />
          <stop offset="45%" stopColor="#D2B88C" />
          <stop offset="100%" stopColor="#896541" />
        </linearGradient>
        <linearGradient id={`heroStone${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4D9C9" />
          <stop offset="100%" stopColor="#C9B9A4" />
        </linearGradient>
        <radialGradient id={`heroShadow${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#314227" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#314227" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="357" cy="192" r="178" fill="#FFFFFF" opacity="0.23" />
      <circle cx="480" cy="111" r="106" fill="#FFFFFF" opacity="0.18" />

      <g opacity="0.82">
        <path
          d="M96 370C132 298 167 230 235 179"
          fill="none"
          stroke="#557244"
          strokeWidth="3"
        />
        <path
          d="M127 324c-29-4-51-24-58-51 31-1 57 14 68 43"
          fill={`url(#heroLeaf${id})`}
          transform="rotate(-18 127 324)"
        />
        <path
          d="M154 267c-33-1-59-20-70-50 34-4 63 11 78 40"
          fill={`url(#heroLeaf${id})`}
          transform="rotate(-10 154 267)"
        />
        <path
          d="M189 218c-29-8-48-29-52-57 31 3 54 21 63 48"
          fill={`url(#heroLeaf${id})`}
          transform="rotate(4 189 218)"
        />
        <path
          d="M555 313c-19-46-15-95 13-138"
          fill="none"
          stroke="#557244"
          strokeWidth="2.5"
        />
        <path
          d="M554 256c12-29 36-46 65-49-6 30-26 51-55 59"
          fill={`url(#heroLeaf${id})`}
          transform="rotate(8 554 256)"
        />
        <path
          d="M556 207c5-25 24-45 49-51 0 27-16 48-42 59"
          fill={`url(#heroLeaf${id})`}
          transform="rotate(-4 556 207)"
        />
      </g>

      <g opacity="0.3" fill="none" stroke="#F8F8F0" strokeWidth="2">
        <path d="M172 120c18-17 42-24 65-20" />
        <path d="M509 173c17 4 31 16 38 31" />
      </g>

      <ellipse cx="369" cy="414" rx="231" ry="30" fill={`url(#heroShadow${id})`} />
      <path
        d="M136 368h431c10 0 18 8 18 18v17c0 9-8 17-17 17H151c-11 0-20-9-20-20l5-32Z"
        fill={`url(#heroStone${id})`}
      />
      <path d="M131 386h454v9H131z" fill="#FFFFFF" opacity="0.26" />
      <path
        d="M147 402h424v3c0 8-7 15-15 15H162c-8 0-15-7-15-15v-3Z"
        fill="#B9A78F"
        opacity="0.63"
      />
      <path d="M191 382c24-14 52-19 80-14" stroke="#FFFFFF" strokeWidth="2" opacity="0.28" fill="none" />

      <g>
        <rect x="239" y="160" width="103" height="205" rx="47" fill={`url(#heroGlass${id})`} />
        <rect x="247" y="170" width="86" height="32" fill="#FFFFFF" opacity="0.13" />
        <rect x="254" y="137" width="73" height="32" rx="10" fill="#23451B" />
        <rect x="262" y="132" width="57" height="8" rx="4" fill="#23451B" opacity="0.82" />
        <rect x="247" y="227" width="87" height="100" fill="#F7F6EC" opacity="0.96" />
        <text x="291" y="252" textAnchor="middle" fill="#23451B" fontSize="12" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="2">PURELIS</text>
        <line x1="263" y1="263" x2="318" y2="263" stroke="#23451B" strokeWidth="0.8" opacity="0.4" />
        <text x="291" y="280" textAnchor="middle" fill="#23451B" fontSize="5.8" fontFamily="Montserrat, sans-serif" letterSpacing="1.3">GREEN TEA CLEANSER</text>
        <path d="M271 301h40" stroke="#526749" strokeWidth="1" opacity="0.35" />
        <path d="M247 237v78" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.16" />
      </g>

      <g>
        <rect x="343" y="188" width="105" height="178" rx="31" fill={`url(#heroAmber${id})`} />
        <rect x="352" y="198" width="87" height="15" fill="#FFFFFF" opacity="0.14" />
        <rect x="369" y="149" width="53" height="46" rx="12" fill="#273B22" />
        <rect x="373" y="154" width="10" height="32" rx="5" fill="#FFFFFF" opacity="0.12" />
        <rect x="378" y="190" width="35" height="18" rx="4" fill="#795838" />
        <rect x="351" y="236" width="89" height="97" fill="#F8F3E7" opacity="0.96" />
        <text x="395" y="260" textAnchor="middle" fill="#2A4024" fontSize="12" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="2">PURELIS</text>
        <line x1="368" y1="270" x2="422" y2="270" stroke="#2A4024" strokeWidth="0.8" opacity="0.4" />
        <text x="395" y="287" textAnchor="middle" fill="#2A4024" fontSize="5.8" fontFamily="Montserrat, sans-serif" letterSpacing="1.2">VITAMIN C SERUM</text>
        <circle cx="395" cy="312" r="10" fill="none" stroke="#795838" strokeWidth="0.8" opacity="0.52" />
        <path d="M390 312h10M395 307v10" stroke="#795838" strokeWidth="0.8" opacity="0.52" />
      </g>

      <g>
        <ellipse cx="502" cy="350" rx="59" ry="10" fill="#314227" opacity="0.08" />
        <rect x="446" y="266" width="113" height="35" rx="13" fill="#2E4727" />
        <rect x="455" y="271" width="95" height="8" rx="4" fill="#FFFFFF" opacity="0.12" />
        <path
          d="M452 297h101v39c0 18-15 33-33 33h-35c-18 0-33-15-33-33v-39Z"
          fill={`url(#heroGlass${id})`}
        />
        <rect x="463" y="315" width="79" height="35" fill="#F8F5E9" opacity="0.95" />
        <text x="502" y="331" textAnchor="middle" fill="#2A4024" fontSize="8" fontFamily="'Playfair Display', Georgia, serif" letterSpacing="1.3">PURELIS</text>
        <text x="502" y="342" textAnchor="middle" fill="#2A4024" fontSize="4.7" fontFamily="Montserrat, sans-serif" letterSpacing="1">HYDRA BARRIER</text>
      </g>

      <g transform="translate(523 332)">
        <path d="M0 12c17-25 43-30 63-13-12 26-39 36-63 13Z" fill="#748B60" />
        <path d="M58 7c-16-18-15-42 2-57 18 17 21 41 5 59" fill="#8DA47B" />
        <circle cx="9" cy="35" r="3" fill="#E9DFC9" />
        <circle cx="44" cy="-19" r="2.4" fill="#E9DFC9" />
        <circle cx="89" cy="23" r="2" fill="#E9DFC9" />
      </g>

      <g transform="translate(174 353)">
        <path d="M0 0c-9 12-23 18-38 16 2-16 14-29 31-32" fill="#557244" />
        <path d="M3 2c2-16 12-30 27-36 5 16-2 32-17 41" fill="#6E8759" />
        <path d="M-2 4c-16-3-29-13-34-28 16-4 32 3 40 18" fill="#4A673A" />
      </g>

      <g transform="translate(585 368)">
        <circle cx="0" cy="0" r="5" fill="#FBF8F0" />
        <ellipse cx="10" cy="4" rx="8" ry="5" fill="#FBF8F0" transform="rotate(28 10 4)" />
        <ellipse cx="3" cy="12" rx="8" ry="5" fill="#FBF8F0" transform="rotate(78 3 12)" />
        <ellipse cx="-9" cy="7" rx="8" ry="5" fill="#FBF8F0" transform="rotate(140 -9 7)" />
        <ellipse cx="-8" cy="-6" rx="8" ry="5" fill="#FBF8F0" transform="rotate(205 -8 -6)" />
        <ellipse cx="4" cy="-10" rx="8" ry="5" fill="#FBF8F0" transform="rotate(278 4 -10)" />
        <circle cx="0" cy="0" r="3" fill="#D9C27C" />
      </g>
    </svg>
  );
}
