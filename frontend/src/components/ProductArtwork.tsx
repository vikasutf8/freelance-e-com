import { useId } from 'react';
import { cn } from '../utils/cn';

type ArtKind =
  | 'tube'
  | 'dropper'
  | 'jar'
  | 'sun'
  | 'kit'
  | 'lip'
  | 'toner'
  | 'bottle';

interface ProductArtworkProps {
  name: string;
  className?: string;
  variant?: ArtKind;
  decorative?: boolean;
}

interface Palette {
  from: string;
  to: string;
  package: string;
  packageDeep: string;
  cap: string;
  label: string;
  accent: string;
}

const palettes: Palette[] = [
  {
    from: '#EFF4E7',
    to: '#DDE8D2',
    package: '#819878',
    packageDeep: '#526749',
    cap: '#23451B',
    label: '#F8F7ED',
    accent: '#C6D8B9',
  },
  {
    from: '#F6F0E8',
    to: '#EBDFD2',
    package: '#C3A184',
    packageDeep: '#8D6F54',
    cap: '#38502F',
    label: '#FBF7EF',
    accent: '#E5C9B7',
  },
  {
    from: '#F0F2E9',
    to: '#E2E6D6',
    package: '#5E7F4A',
    packageDeep: '#355328',
    cap: '#C9BDAF',
    label: '#F5F2E8',
    accent: '#B6C8A8',
  },
  {
    from: '#F7F1EC',
    to: '#F0E1D9',
    package: '#D5A48F',
    packageDeep: '#A26F5C',
    cap: '#4D6044',
    label: '#FFF9F2',
    accent: '#EDBEAC',
  },
];

function kindFromName(name: string, variant?: ArtKind): ArtKind {
  if (variant) return variant;
  const value = name.toLowerCase();
  if (/(lip|balm)/.test(value)) return 'lip';
  if (/(kit|set|ritual|collection|bundle)/.test(value)) return 'kit';
  if (/(sun|spf|sunscreen|uv)/.test(value)) return 'sun';
  if (/(moistur|cream|butter|barrier|lotion)/.test(value)) return 'jar';
  if (/(serum|drop|oil|vitamin|retinol|essence|ampoule)/.test(value))
    return 'dropper';
  if (/(wash|cleanser|foam|gel|scrub)/.test(value)) return 'tube';
  if (/(toner|mist|water)/.test(value)) return 'toner';
  return 'bottle';
}

function hashName(name: string): number {
  return name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function labelFor(kind: ArtKind): string {
  const labels: Record<ArtKind, string> = {
    tube: 'DAILY CLEANSER',
    dropper: 'CONCENTRATED SERUM',
    jar: 'BARRIER CREAM',
    sun: 'BROAD SPECTRUM SPF',
    kit: 'COMPLETE RITUAL',
    lip: 'NOURISHING BALM',
    toner: 'HYDRATING MIST',
    bottle: 'SKIN ESSENTIAL',
  };
  return labels[kind];
}

export function ProductArtwork({
  name,
  className,
  variant,
  decorative = false,
}: ProductArtworkProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const kind = kindFromName(name, variant);
  const palette = palettes[hashName(name) % palettes.length];
  const backgroundId = `art-bg-${id}`;
  const glassId = `art-glass-${id}`;
  const shadowId = `art-shadow-${id}`;
  const label = labelFor(kind);

  return (
    <svg
      viewBox="0 0 400 400"
      className={cn('h-full w-full', className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `${name} product illustration`}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id={backgroundId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={palette.package} />
          <stop offset="48%" stopColor={palette.accent} />
          <stop offset="100%" stopColor={palette.packageDeep} />
        </linearGradient>
        <radialGradient id={shadowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#233520" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#233520" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="400" fill={`url(#${backgroundId})`} />
      <circle cx="326" cy="82" r="103" fill="#FFFFFF" opacity="0.31" />
      <circle cx="67" cy="332" r="88" fill="#FFFFFF" opacity="0.22" />
      <circle cx="323" cy="303" r="4" fill={palette.cap} opacity="0.24" />
      <circle cx="300" cy="329" r="2.5" fill={palette.cap} opacity="0.2" />

      <g fill="none" stroke={palette.packageDeep} strokeWidth="2" opacity="0.45">
        <path d="M31 329C73 302 89 257 83 204" />
        <path d="M65 306c-19-5-31-21-33-39 20 0 35 12 41 29" />
        <path d="M77 272c-18-7-27-23-26-41 19 3 31 16 34 34" />
        <path d="M86 236c-15-9-22-25-18-41 17 5 26 19 26 35" />
        <path d="M370 112c-27 12-45 35-50 64" />
        <path d="M340 136c3-17 16-30 33-34-1 18-12 31-29 37" />
        <path d="M325 166c1-16 12-29 28-34 0 17-10 31-26 37" />
      </g>

      <ellipse cx="204" cy="332" rx="121" ry="28" fill={`url(#${shadowId})`} />

      {kind === 'tube' ? (
        <g>
          <rect
            x="153"
            y="112"
            width="96"
            height="204"
            rx="43"
            fill={`url(#${glassId})`}
          />
          <path
            d="M163 120h76v45c-20 11-56 11-76 0v-45Z"
            fill="#FFFFFF"
            opacity="0.16"
          />
          <rect x="166" y="92" width="70" height="31" rx="10" fill={palette.cap} />
          <rect x="174" y="87" width="54" height="8" rx="4" fill={palette.cap} opacity="0.8" />
          <rect x="160" y="174" width="82" height="103" rx="18" fill={palette.label} opacity="0.96" />
          <text
            x="201"
            y="200"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="11"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.8"
          >
            PURELIS
          </text>
          <line x1="177" y1="211" x2="225" y2="211" stroke={palette.cap} strokeWidth="0.8" opacity="0.4" />
          <text
            x="201"
            y="228"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.6"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.3"
          >
            {label}
          </text>
          <path d="M185 247h32" stroke={palette.packageDeep} strokeWidth="1" opacity="0.38" />
          <path d="M185 255h20" stroke={palette.packageDeep} strokeWidth="1" opacity="0.25" />
        </g>
      ) : null}

      {kind === 'dropper' ? (
        <g>
          <rect x="175" y="77" width="50" height="50" rx="13" fill={palette.cap} />
          <rect x="179" y="82" width="9" height="36" rx="4" fill="#FFFFFF" opacity="0.13" />
          <rect x="184" y="125" width="32" height="27" rx="6" fill={palette.packageDeep} />
          <path
            d="M148 169c0-15 12-27 27-27h50c15 0 27 12 27 27v122c0 16-13 29-29 29h-46c-16 0-29-13-29-29V169Z"
            fill={`url(#${glassId})`}
          />
          <rect x="148" y="192" width="104" height="113" fill={palette.label} opacity="0.94" />
          <text
            x="200"
            y="217"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="11"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.9"
          >
            PURELIS
          </text>
          <line x1="170" y1="227" x2="230" y2="227" stroke={palette.cap} strokeWidth="0.75" opacity="0.4" />
          <text
            x="200"
            y="244"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.5"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.2"
          >
            {label}
          </text>
          <circle cx="200" cy="269" r="10" fill="none" stroke={palette.packageDeep} strokeWidth="0.9" opacity="0.5" />
          <path d="M195 269h10M200 264v10" stroke={palette.packageDeep} strokeWidth="0.9" opacity="0.5" />
          <path d="M157 175v91" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.18" />
        </g>
      ) : null}

      {kind === 'jar' ? (
        <g>
          <ellipse cx="200" cy="313" rx="91" ry="16" fill={palette.packageDeep} opacity="0.1" />
          <rect x="116" y="171" width="168" height="44" rx="17" fill={palette.cap} />
          <rect x="126" y="177" width="148" height="11" rx="5.5" fill="#FFFFFF" opacity="0.12" />
          <path
            d="M128 213h144v78c0 21-17 38-38 38h-68c-21 0-38-17-38-38v-78Z"
            fill={`url(#${glassId})`}
          />
          <rect x="139" y="238" width="122" height="58" fill={palette.label} opacity="0.94" />
          <text
            x="200"
            y="260"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="11"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.9"
          >
            PURELIS
          </text>
          <line x1="170" y1="270" x2="230" y2="270" stroke={palette.cap} strokeWidth="0.75" opacity="0.4" />
          <text
            x="200"
            y="285"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.5"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.2"
          >
            {label}
          </text>
          <path d="M139 222h122" stroke="#FFFFFF" strokeWidth="4" opacity="0.18" />
        </g>
      ) : null}

      {kind === 'sun' ? (
        <g>
          <rect x="158" y="94" width="90" height="37" rx="12" fill={palette.cap} />
          <rect x="167" y="100" width="72" height="8" rx="4" fill="#FFFFFF" opacity="0.16" />
          <path
            d="M150 129h106v157c0 23-19 42-42 42h-22c-23 0-42-19-42-42V129Z"
            fill={`url(#${glassId})`}
          />
          <path d="M150 129h106v58H150z" fill={palette.accent} opacity="0.55" />
          <rect x="158" y="196" width="90" height="91" rx="12" fill={palette.label} opacity="0.96" />
          <circle cx="203" cy="220" r="10" fill="none" stroke={palette.cap} strokeWidth="1.2" opacity="0.65" />
          <path d="M203 214v-3M203 229v-3M197 220h-3M212 220h-3M199 216l-2-2M209 226l-2-2M207 216l2-2M199 224l-2 2" stroke={palette.cap} strokeWidth="1" strokeLinecap="round" opacity="0.65" />
          <text
            x="203"
            y="248"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="8.5"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.2"
          >
            PURELIS
          </text>
          <text
            x="203"
            y="262"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.8"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.2"
          >
            SPF 50
          </text>
        </g>
      ) : null}

      {kind === 'kit' ? (
        <g>
          <rect x="139" y="159" width="54" height="130" rx="14" fill={palette.packageDeep} />
          <rect x="147" y="149" width="38" height="19" rx="6" fill={palette.cap} />
          <rect x="145" y="192" width="42" height="54" fill={palette.label} opacity="0.92" />
          <rect x="212" y="177" width="48" height="112" rx="17" fill={palette.package} />
          <rect x="220" y="160" width="32" height="24" rx="7" fill={palette.cap} />
          <rect x="218" y="206" width="36" height="44" fill={palette.label} opacity="0.92" />
          <path
            d="M103 273h194v49c0 8-7 15-15 15H118c-8 0-15-7-15-15v-49Z"
            fill={palette.accent}
          />
          <path d="M103 273h194v11H103z" fill={palette.label} opacity="0.72" />
          <text
            x="200"
            y="309"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="10"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="2"
          >
            PURELIS
          </text>
          <text
            x="200"
            y="321"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.2"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.2"
          >
            THE RITUAL SET
          </text>
        </g>
      ) : null}

      {kind === 'lip' ? (
        <g>
          <rect x="171" y="113" width="58" height="43" rx="9" fill={palette.cap} transform="rotate(8 200 134)" />
          <rect x="177" y="151" width="48" height="157" rx="13" fill={`url(#${glassId})`} />
          <rect x="177" y="202" width="48" height="76" fill={palette.label} opacity="0.94" />
          <text
            x="201"
            y="220"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="6.2"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.1"
          >
            PURELIS
          </text>
          <line x1="186" y1="228" x2="216" y2="228" stroke={palette.cap} strokeWidth="0.6" opacity="0.4" />
          <text
            x="201"
            y="242"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="4.5"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="0.9"
          >
            TINTED BALM
          </text>
          <circle cx="201" cy="259" r="7" fill={palette.accent} opacity="0.75" />
        </g>
      ) : null}

      {kind === 'toner' ? (
        <g>
          <rect x="169" y="87" width="62" height="31" rx="8" fill={palette.cap} />
          <rect x="176" y="113" width="48" height="19" fill={palette.packageDeep} />
          <path
            d="M148 147c0-10 8-18 18-18h68c10 0 18 8 18 18v148c0 17-14 31-31 31h-42c-17 0-31-14-31-31V147Z"
            fill={`url(#${glassId})`}
          />
          <rect x="157" y="184" width="86" height="111" fill={palette.label} opacity="0.95" />
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="11"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.9"
          >
            PURELIS
          </text>
          <line x1="174" y1="221" x2="226" y2="221" stroke={palette.cap} strokeWidth="0.75" opacity="0.4" />
          <text
            x="200"
            y="238"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.5"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.2"
          >
            {label}
          </text>
          <path d="M180 258c11 8 29 8 40 0" fill="none" stroke={palette.packageDeep} strokeWidth="1" opacity="0.4" />
          <path d="M157 193v82" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.16" />
        </g>
      ) : null}

      {kind === 'bottle' ? (
        <g>
          <rect x="170" y="88" width="60" height="29" rx="8" fill={palette.cap} />
          <rect x="178" y="112" width="44" height="20" fill={palette.packageDeep} />
          <path
            d="M151 153c0-13 10-23 23-23h52c13 0 23 10 23 23v137c0 18-14 32-32 32h-34c-18 0-32-14-32-32V153Z"
            fill={`url(#${glassId})`}
          />
          <rect x="160" y="185" width="80" height="105" fill={palette.label} opacity="0.94" />
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="10.5"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="1.8"
          >
            PURELIS
          </text>
          <line x1="176" y1="220" x2="224" y2="220" stroke={palette.cap} strokeWidth="0.7" opacity="0.4" />
          <text
            x="200"
            y="237"
            textAnchor="middle"
            fill={palette.cap}
            fontSize="5.4"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="1.1"
          >
            {label}
          </text>
          <path d="M180 257h40" stroke={palette.packageDeep} strokeWidth="1" opacity="0.32" />
          <path d="M160 194v80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.16" />
        </g>
      ) : null}

      <circle cx="75" cy="91" r="3.5" fill={palette.cap} opacity="0.17" />
      <circle cx="93" cy="111" r="2" fill={palette.cap} opacity="0.17" />
    </svg>
  );
}
