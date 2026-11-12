import React from 'react';

interface PuzzleArtworkProps {
  artworkKey: string;
  silhouette?: boolean;
  className?: string;
}

const HouseMasterScene: React.FC = () => (
  <g>
    {/* Sky & meadow backdrop */}
    <rect x="0" y="0" width="200" height="150" fill="#E0F2FE" />
    <rect x="0" y="150" width="200" height="50" fill="#86EFAC" />
    <circle cx="168" cy="30" r="14" fill="#FBBF24" />
    <circle cx="40" cy="28" r="10" fill="#FFFFFF" opacity="0.9" />
    <circle cx="52" cy="28" r="13" fill="#FFFFFF" opacity="0.9" />
    <circle cx="64" cy="30" r="9" fill="#FFFFFF" opacity="0.9" />
    {/* Chimney */}
    <rect x="134" y="34" width="20" height="40" rx="2" fill="#991B1B" />
    <rect x="131" y="30" width="26" height="8" rx="2" fill="#7F1D1D" />
    {/* Roof (y: 26 to 106, spans across split boundary y=100 seamlessly) */}
    <polygon points="100,24 22,102 178,102" fill="#DC2626" stroke="#991B1B" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="100" cy="68" r="13" fill="#FEF3C7" stroke="#92400E" strokeWidth="3" />
    <line x1="100" y1="55" x2="100" y2="81" stroke="#92400E" strokeWidth="2" />
    <line x1="87" y1="68" x2="113" y2="68" stroke="#92400E" strokeWidth="2" />
    {/* Cottage Walls (y: 100 to 178) */}
    <rect x="36" y="100" width="128" height="78" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
    {/* Door */}
    <rect x="84" y="128" width="32" height="50" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="2" />
    <circle cx="109" cy="154" r="3" fill="#FBBF24" />
    {/* Windows */}
    <rect x="48" y="118" width="24" height="24" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
    <line x1="60" y1="118" x2="60" y2="142" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="48" y1="130" x2="72" y2="130" stroke="#FFFFFF" strokeWidth="2" />
    <rect x="128" y="118" width="24" height="24" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
    <line x1="140" y1="118" x2="140" y2="142" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="128" y1="130" x2="152" y2="130" stroke="#FFFFFF" strokeWidth="2" />
    {/* Pathway & flowers */}
    <polygon points="86,178 114,178 124,200 76,200" fill="#CBD5E1" />
    <circle cx="48" cy="184" r="5" fill="#F43F5E" />
    <circle cx="152" cy="184" r="5" fill="#F59E0B" />
  </g>
);

const RocketMasterScene: React.FC = () => (
  <g>
    {/* Space Backdrop */}
    <rect x="0" y="0" width="180" height="270" fill="#0F172A" />
    <circle cx="24" cy="30" r="2.5" fill="#F8FAFC" />
    <circle cx="150" cy="48" r="3" fill="#FDE047" />
    <circle cx="32" cy="128" r="2" fill="#93C5FD" />
    <circle cx="156" cy="145" r="2.5" fill="#F8FAFC" />
    <circle cx="26" cy="220" r="3" fill="#FDE047" />
    <circle cx="152" cy="235" r="2" fill="#93C5FD" />
    {/* Strip 1: Nose Cone (0..90) */}
    <path d="M90 22 C66 52 58 76 56 96 L124 96 C122 76 114 52 90 22 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
    <circle cx="90" cy="64" r="7" fill="#FBBF24" />
    {/* Strip 2: Main Cabin & Window (90..180) */}
    <rect x="56" y="88" width="68" height="94" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="56" y="88" width="68" height="10" fill="#E11D48" />
    <circle cx="90" cy="136" r="21" fill="#0284C7" stroke="#334155" strokeWidth="4" />
    <circle cx="84" cy="130" r="6" fill="#BAE6FD" opacity="0.7" />
    <rect x="56" y="170" width="68" height="12" fill="#334155" />
    {/* Strip 3: Fins, Nozzle & Flame (180..270) */}
    <polygon points="56,178 30,214 56,204" fill="#DC2626" />
    <polygon points="124,178 150,214 124,204" fill="#DC2626" />
    <rect x="66" y="180" width="48" height="18" rx="3" fill="#475569" />
    <polygon points="74,198 106,198 90,256" fill="#F97316" />
    <polygon points="81,198 99,198 90,238" fill="#FDE047" />
  </g>
);

const FishMasterScene: React.FC = () => (
  <g>
    {/* Ocean Backdrop */}
    <rect x="0" y="0" width="270" height="160" fill="#CFFAFE" />
    <path d="M0 132 Q45 122 90 132 T180 132 T270 132 L270 160 L0 160 Z" fill="#67E8F9" />
    <circle cx="236" cy="30" r="6" fill="#FFFFFF" opacity="0.7" />
    <circle cx="246" cy="48" r="4" fill="#FFFFFF" opacity="0.7" />
    <circle cx="52" cy="38" r="5" fill="#FFFFFF" opacity="0.6" />
    {/* Left Piece (0..90): Tail Fin */}
    <path d="M94 80 L24 38 C36 65 36 95 24 122 Z" fill="#F97316" stroke="#C2410C" strokeWidth="3" strokeLinejoin="round" />
    <path d="M92 80 L48 58 M92 80 L48 102" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
    {/* Middle Piece (90..180): Striped Torso & Dorsal Fin */}
    <path d="M136 22 C116 20 100 34 102 48 L168 48 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="2.5" />
    <ellipse cx="145" cy="80" rx="75" ry="44" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
    <path d="M118 42 C110 65 110 95 118 118" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
    <path d="M150 37 C142 65 142 95 150 123" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
    {/* Right Piece (180..270): Smiling Head & Eye */}
    <path d="M178 39 C212 45 232 62 232 80 C232 98 212 115 178 121 Z" fill="#FBBF24" />
    <path d="M178 39 C212 45 232 62 232 80 C232 98 212 115 178 121" fill="none" stroke="#B45309" strokeWidth="3" />
    <circle cx="204" cy="68" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <circle cx="207" cy="68" r="4.5" fill="#0F172A" />
    <circle cx="209" cy="66" r="1.5" fill="#FFFFFF" />
    <path d="M204 94 Q216 98 224 90" fill="none" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
  </g>
);

const TreeMasterScene: React.FC = () => (
  <g>
    {/* Park Backdrop */}
    <rect x="0" y="0" width="240" height="196" fill="#E0F2FE" />
    <rect x="0" y="196" width="240" height="44" fill="#86EFAC" />
    <circle cx="34" cy="30" r="14" fill="#FBBF24" />
    {/* Trunk spanning lower quadrants cleanly across x=120 */}
    <path d="M102 114 L138 114 L144 212 C144 216 156 220 156 220 L84 220 C84 220 96 216 96 212 Z" fill="#92400E" stroke="#78350F" strokeWidth="3" />
    <path d="M120 120 L120 212" stroke="#78350F" strokeWidth="2" opacity="0.4" />
    <path d="M104 128 L86 106 M136 128 L154 106" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
    {/* Lush Canopy spanning upper/mid quadrants cleanly across x=120 & y=120 */}
    <circle cx="78" cy="94" r="42" fill="#16A34A" />
    <circle cx="162" cy="94" r="42" fill="#15803D" />
    <circle cx="120" cy="60" r="48" fill="#22C55E" />
    <circle cx="86" cy="54" r="30" fill="#4ADE80" opacity="0.6" />
    {/* Apples across both top quadrants */}
    <circle cx="76" cy="84" r="8" fill="#DC2626" />
    <circle cx="160" cy="74" r="8" fill="#DC2626" />
    <circle cx="120" cy="42" r="8" fill="#DC2626" />
    <circle cx="144" cy="108" r="8" fill="#DC2626" />
    <circle cx="88" cy="112" r="8" fill="#DC2626" />
    {/* Ground Flowers */}
    <circle cx="52" cy="212" r="6" fill="#F43F5E" />
    <circle cx="190" cy="212" r="6" fill="#F59E0B" />
  </g>
);

const ButterflyMasterScene: React.FC = () => (
  <g>
    <rect x="0" y="0" width="200" height="180" fill="#FDF2F8" />
    {/* Left Wing (0..80) */}
    <path d="M84 82 C46 22 10 34 16 78 C20 100 54 102 84 96 Z" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
    <path d="M84 98 C44 100 22 128 36 150 C52 168 78 142 84 110 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
    <circle cx="44" cy="68" r="11" fill="#FDE047" />
    <circle cx="54" cy="128" r="8" fill="#A855F7" />
    {/* Right Wing (120..200) */}
    <path d="M116 82 C154 22 190 34 184 78 C180 100 146 102 116 96 Z" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
    <path d="M116 98 C156 100 178 128 164 150 C148 168 122 142 116 110 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
    <circle cx="156" cy="68" r="11" fill="#FDE047" />
    <circle cx="146" cy="128" r="8" fill="#A855F7" />
    {/* Center Body (80..120) */}
    <rect x="88" y="56" width="24" height="86" rx="12" fill="#4C1D95" />
    <circle cx="100" cy="48" r="15" fill="#6D28D9" />
    <circle cx="95" cy="46" r="2.5" fill="#FFFFFF" />
    <circle cx="105" cy="46" r="2.5" fill="#FFFFFF" />
    <path d="M94 35 Q84 16 74 20" fill="none" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M106 35 Q116 16 126 20" fill="none" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />
  </g>
);

export const PuzzleArtwork: React.FC<PuzzleArtworkProps> = ({
  artworkKey,
  silhouette = false,
  className = 'w-16 h-16',
}) => {
  const fillCol = silhouette ? '#94A3B8' : undefined;
  const shadowOpacity = silhouette ? 'opacity-70' : '';

  switch (artworkKey) {
    // Level 1: Shapes
    case 'shape-circle':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${shadowOpacity}`} aria-hidden="true">
          <circle cx="50" cy="50" r="38" fill={fillCol || '#2563EB'} stroke={silhouette ? '#475569' : '#1D4ED8'} strokeWidth="5" strokeDasharray={silhouette ? '7 5' : undefined} />
          {!silhouette && <circle cx="38" cy="36" r="9" fill="#93C5FD" opacity="0.5" />}
        </svg>
      );
    case 'shape-square':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${shadowOpacity}`} aria-hidden="true">
          <rect x="14" y="14" width="72" height="72" rx="12" fill={fillCol || '#DC2626'} stroke={silhouette ? '#475569' : '#991B1B'} strokeWidth="5" strokeDasharray={silhouette ? '7 5' : undefined} />
          {!silhouette && <rect x="24" y="24" width="18" height="18" rx="4" fill="#FCA5A5" opacity="0.45" />}
        </svg>
      );
    case 'shape-triangle':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${shadowOpacity}`} aria-hidden="true">
          <polygon points="50,12 88,84 12,84" fill={fillCol || '#10B981'} stroke={silhouette ? '#475569' : '#047857'} strokeWidth="5" strokeLinejoin="round" strokeDasharray={silhouette ? '7 5' : undefined} />
        </svg>
      );
    case 'shape-star':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${shadowOpacity}`} aria-hidden="true">
          <polygon points="50,10 61,36 90,38 68,57 75,86 50,70 25,86 32,57 10,38 39,36" fill={fillCol || '#F59E0B'} stroke={silhouette ? '#475569' : '#B45309'} strokeWidth="4" strokeLinejoin="round" strokeDasharray={silhouette ? '7 5' : undefined} />
        </svg>
      );

    // Level 2: Shadow Matching Objects
    case 'obj-car':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <path d="M22 46 L34 22 L84 22 L98 46 L108 50 L108 68 L12 68 L12 50 Z" fill={silhouette ? '#1E293B' : '#DC2626'} />
          {!silhouette && (
            <>
              <polygon points="38,27 56,27 56,44 28,44" fill="#BAE6FD" />
              <polygon points="62,27 80,27 91,44 62,44" fill="#BAE6FD" />
              <rect x="98" y="52" width="8" height="7" rx="2" fill="#FDE047" />
            </>
          )}
          <circle cx="34" cy="70" r="12" fill={silhouette ? '#1E293B' : '#0F172A'} />
          <circle cx="86" cy="70" r="12" fill={silhouette ? '#1E293B' : '#0F172A'} />
          {!silhouette && (
            <>
              <circle cx="34" cy="70" r="5" fill="#CBD5E1" />
              <circle cx="86" cy="70" r="5" fill="#CBD5E1" />
            </>
          )}
        </svg>
      );
    case 'obj-ball':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <circle cx="50" cy="50" r="38" fill={silhouette ? '#1E293B' : '#F8FAFC'} stroke={silhouette ? '#1E293B' : '#0F172A'} strokeWidth="4" />
          {!silhouette && (
            <>
              <polygon points="50,32 64,43 59,59 41,59 36,43" fill="#0F172A" />
              <line x1="50" y1="12" x2="50" y2="32" stroke="#0F172A" strokeWidth="3" />
              <line x1="84" y1="38" x2="64" y2="43" stroke="#0F172A" strokeWidth="3" />
              <line x1="16" y1="38" x2="36" y2="43" stroke="#0F172A" strokeWidth="3" />
              <line x1="27" y1="78" x2="41" y2="59" stroke="#0F172A" strokeWidth="3" />
              <line x1="73" y1="78" x2="59" y2="59" stroke="#0F172A" strokeWidth="3" />
            </>
          )}
        </svg>
      );
    case 'obj-plane':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <path d="M14 50 L44 44 L54 16 L68 16 L64 44 L98 44 L108 50 L98 56 L64 56 L68 80 L54 80 L44 56 L18 60 L10 68 L6 68 L14 50 Z" fill={silhouette ? '#1E293B' : '#0284C7'} />
          {!silhouette && (
            <>
              <circle cx="88" cy="49" r="5" fill="#E0F2FE" />
              <circle cx="72" cy="49" r="4" fill="#E0F2FE" />
            </>
          )}
        </svg>
      );
    case 'obj-duck':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M22 66 C18 46 38 44 46 46 C44 26 60 16 74 24 C80 28 82 36 92 38 L80 46 C80 68 68 80 46 80 C30 80 24 74 22 66 Z" fill={silhouette ? '#1E293B' : '#FBBF24'} />
          {!silhouette && (
            <>
              <circle cx="68" cy="30" r="3" fill="#0F172A" />
              <polygon points="80,36 93,38 80,44" fill="#F97316" />
              <path d="M36 58 C44 52 56 54 60 64 C52 70 40 68 36 58 Z" fill="#F59E0B" />
            </>
          )}
        </svg>
      );

    // Level 3: Build the SmartTech Humanoid Robot
    case 'robot-head':
      return (
        <svg viewBox="0 0 100 90" className={className} aria-hidden="true">
          <line x1="50" y1="8" x2="50" y2="22" stroke={silhouette ? '#64748B' : '#DC2626'} strokeWidth="4" />
          <circle cx="50" cy="8" r="6" fill={silhouette ? '#94A3B8' : '#F59E0B'} />
          <rect x="20" y="22" width="60" height="54" rx="14" fill={silhouette ? '#CBD5E1' : '#E2E8F0'} stroke={silhouette ? '#94A3B8' : '#475569'} strokeWidth="3" />
          <rect x="30" y="34" width="40" height="20" rx="8" fill={silhouette ? '#94A3B8' : '#0F172A'} />
          {!silhouette && (
            <>
              <circle cx="41" cy="44" r="5" fill="#38BDF8" />
              <circle cx="59" cy="44" r="5" fill="#38BDF8" />
              <path d="M41 64 Q50 70 59 64" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    case 'robot-body':
      return (
        <svg viewBox="0 0 110 100" className={className} aria-hidden="true">
          <rect x="18" y="10" width="74" height="80" rx="14" fill={silhouette ? '#CBD5E1' : '#F8FAFC'} stroke={silhouette ? '#94A3B8' : '#334155'} strokeWidth="3.5" />
          <rect x="32" y="24" width="46" height="36" rx="8" fill={silhouette ? '#94A3B8' : '#1E293B'} />
          {!silhouette && (
            <>
              <circle cx="44" cy="36" r="5" fill="#EF4444" />
              <circle cx="58" cy="36" r="5" fill="#22C55E" />
              <rect x="38" y="47" width="34" height="6" rx="3" fill="#38BDF8" />
              <rect x="34" y="68" width="42" height="10" rx="4" fill="#DC2626" />
            </>
          )}
        </svg>
      );
    case 'robot-arm-l':
      return (
        <svg viewBox="0 0 60 100" className={className} aria-hidden="true">
          <circle cx="44" cy="22" r="10" fill={silhouette ? '#94A3B8' : '#DC2626'} />
          <rect x="20" y="20" width="16" height="52" rx="8" fill={silhouette ? '#CBD5E1' : '#94A3B8'} stroke={silhouette ? '#94A3B8' : '#475569'} strokeWidth="2.5" />
          <path d="M18 72 L38 72 L34 88 L22 88 Z" fill={silhouette ? '#94A3B8' : '#334155'} />
        </svg>
      );
    case 'robot-arm-r':
      return (
        <svg viewBox="0 0 60 100" className={className} aria-hidden="true">
          <circle cx="16" cy="22" r="10" fill={silhouette ? '#94A3B8' : '#DC2626'} />
          <rect x="24" y="20" width="16" height="52" rx="8" fill={silhouette ? '#CBD5E1' : '#94A3B8'} stroke={silhouette ? '#94A3B8' : '#475569'} strokeWidth="2.5" />
          <path d="M22 72 L42 72 L38 88 L26 88 Z" fill={silhouette ? '#94A3B8' : '#334155'} />
        </svg>
      );
    case 'robot-legs':
      return (
        <svg viewBox="0 0 110 80" className={className} aria-hidden="true">
          <rect x="26" y="6" width="20" height="50" rx="6" fill={silhouette ? '#CBD5E1' : '#64748B'} stroke={silhouette ? '#94A3B8' : '#334155'} strokeWidth="2.5" />
          <rect x="64" y="6" width="20" height="50" rx="6" fill={silhouette ? '#CBD5E1' : '#64748B'} stroke={silhouette ? '#94A3B8' : '#334155'} strokeWidth="2.5" />
          <rect x="18" y="54" width="32" height="18" rx="6" fill={silhouette ? '#94A3B8' : '#DC2626'} />
          <rect x="60" y="54" width="32" height="18" rx="6" fill={silhouette ? '#94A3B8' : '#DC2626'} />
        </svg>
      );

    // Level 4: Sorting Fruits & Toys
    case 'fruit-apple':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M50 28 C34 20 18 34 22 58 C26 82 44 88 50 82 C56 88 74 82 78 58 C82 34 66 20 50 28 Z" fill="#DC2626" />
          <path d="M50 28 Q52 14 60 12" fill="none" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="62" cy="18" rx="10" ry="5" fill="#16A34A" transform="rotate(-20 62 18)" />
        </svg>
      );
    case 'fruit-banana':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M22 68 C38 82 78 72 82 24 C74 42 52 58 22 56 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" strokeLinejoin="round" />
          <rect x="78" y="18" width="6" height="8" rx="2" fill="#78350F" />
        </svg>
      );
    case 'fruit-grapes':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <line x1="50" y1="14" x2="50" y2="28" stroke="#78350F" strokeWidth="4" />
          <circle cx="38" cy="36" r="11" fill="#7C3AED" />
          <circle cx="62" cy="36" r="11" fill="#7C3AED" />
          <circle cx="50" cy="40" r="11" fill="#8B5CF6" />
          <circle cx="42" cy="56" r="11" fill="#7C3AED" />
          <circle cx="58" cy="56" r="11" fill="#8B5CF6" />
          <circle cx="50" cy="72" r="11" fill="#6D28D9" />
        </svg>
      );
    case 'toy-bear':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <circle cx="30" cy="28" r="11" fill="#B45309" />
          <circle cx="70" cy="28" r="11" fill="#B45309" />
          <circle cx="50" cy="42" r="22" fill="#D97706" />
          <ellipse cx="50" cy="72" rx="22" ry="18" fill="#B45309" />
          <ellipse cx="50" cy="48" rx="9" ry="7" fill="#FEF3C7" />
          <circle cx="42" cy="38" r="3" fill="#0F172A" />
          <circle cx="58" cy="38" r="3" fill="#0F172A" />
          <circle cx="50" cy="46" r="3" fill="#0F172A" />
        </svg>
      );
    case 'toy-blocks':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="16" y="48" width="32" height="32" rx="5" fill="#2563EB" />
          <rect x="52" y="48" width="32" height="32" rx="5" fill="#10B981" />
          <rect x="34" y="16" width="32" height="32" rx="5" fill="#F59E0B" />
          <text x="50" y="37" textAnchor="middle" fill="#FFF" fontSize="14" fontWeight="bold">A</text>
          <text x="32" y="69" textAnchor="middle" fill="#FFF" fontSize="14" fontWeight="bold">B</text>
          <text x="68" y="69" textAnchor="middle" fill="#FFF" fontSize="14" fontWeight="bold">C</text>
        </svg>
      );
    case 'toy-drum':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="20" y="34" width="60" height="44" rx="8" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
          <ellipse cx="50" cy="34" rx="30" ry="9" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
          <polygon points="24,42 36,74 48,42 60,74 74,42" fill="none" stroke="#FBBF24" strokeWidth="3" />
        </svg>
      );
    case 'bin-basket':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <path d="M18 36 L102 36 L90 78 L30 78 Z" fill="#D97706" stroke="#92400E" strokeWidth="3" strokeLinejoin="round" />
          <rect x="12" y="28" width="96" height="11" rx="5" fill="#B45309" />
          <path d="M36 28 C42 8 78 8 84 28" fill="none" stroke="#78350F" strokeWidth="5" />
          <line x1="36" y1="42" x2="40" y2="74" stroke="#92400E" strokeWidth="3" />
          <line x1="60" y1="42" x2="60" y2="74" stroke="#92400E" strokeWidth="3" />
          <line x1="84" y1="42" x2="80" y2="74" stroke="#92400E" strokeWidth="3" />
        </svg>
      );
    case 'bin-toybox':
      return (
        <svg viewBox="0 0 120 90" className={className} aria-hidden="true">
          <rect x="16" y="30" width="88" height="48" rx="6" fill="#2563EB" stroke="#1E40AF" strokeWidth="3" />
          <rect x="12" y="20" width="96" height="14" rx="4" fill="#1D4ED8" />
          <polygon points="60,40 65,50 76,51 68,59 70,70 60,64 50,70 52,59 44,51 55,50" fill="#FBBF24" />
        </svg>
      );

    // Level 5: Butterfly Triptych (200x180 master)
    case 'butterfly-wing-l':
      return (
        <svg viewBox="0 0 84 180" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="4" width="76" height="172" rx="10" fill="#FCE7F3" stroke="#EC4899" strokeDasharray="6 4" strokeWidth="3" /> : <ButterflyMasterScene />}
        </svg>
      );
    case 'butterfly-body':
      return (
        <svg viewBox="84 0 32 180" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="86" y="4" width="28" height="172" rx="10" fill="#EDE9FE" stroke="#8B5CF6" strokeDasharray="6 4" strokeWidth="3" /> : <ButterflyMasterScene />}
        </svg>
      );
    case 'butterfly-wing-r':
      return (
        <svg viewBox="116 0 84 180" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="120" y="4" width="76" height="172" rx="10" fill="#FCE7F3" stroke="#EC4899" strokeDasharray="6 4" strokeWidth="3" /> : <ButterflyMasterScene />}
        </svg>
      );

    // Level 6: Build the Garden (5 ordered layers)
    case 'garden-flower':
      return (
        <svg viewBox="0 0 120 70" className={className} aria-hidden="true">
          {!silhouette ? (
            <>
              <circle cx="60" cy="18" r="14" fill="#F43F5E" />
              <circle cx="42" cy="34" r="14" fill="#FB7185" />
              <circle cx="78" cy="34" r="14" fill="#FB7185" />
              <circle cx="48" cy="52" r="14" fill="#F43F5E" />
              <circle cx="72" cy="52" r="14" fill="#F43F5E" />
              <circle cx="60" cy="35" r="13" fill="#FACC15" />
            </>
          ) : (
            <circle cx="60" cy="35" r="26" fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray="6 4" />
          )}
        </svg>
      );
    case 'garden-leaves':
      return (
        <svg viewBox="0 0 120 55" className={className} aria-hidden="true">
          <rect x="55" y="0" width="10" height="55" fill={silhouette ? '#CBD5E1' : '#16A34A'} />
          <path d="M55 28 C30 10 14 22 24 40 C34 48 48 40 55 34 Z" fill={silhouette ? '#CBD5E1' : '#22C55E'} />
          <path d="M65 28 C90 10 106 22 96 40 C86 48 72 40 65 34 Z" fill={silhouette ? '#CBD5E1' : '#22C55E'} />
        </svg>
      );
    case 'garden-stem':
      return (
        <svg viewBox="0 0 120 50" className={className} aria-hidden="true">
          <rect x="55" y="0" width="10" height="50" rx="4" fill={silhouette ? '#CBD5E1' : '#15803D'} />
        </svg>
      );
    case 'garden-soil':
      return (
        <svg viewBox="0 0 120 40" className={className} aria-hidden="true">
          <path d="M18 32 Q60 6 102 32 Z" fill={silhouette ? '#CBD5E1' : '#78350F'} />
          {!silhouette && (
            <>
              <circle cx="42" cy="24" r="3" fill="#B45309" />
              <circle cx="76" cy="26" r="3" fill="#B45309" />
            </>
          )}
        </svg>
      );
    case 'garden-pot':
      return (
        <svg viewBox="0 0 120 65" className={className} aria-hidden="true">
          <rect x="16" y="4" width="88" height="14" rx="4" fill={silhouette ? '#CBD5E1' : '#EA580C'} />
          <polygon points="24,18 96,18 84,60 36,60" fill={silhouette ? '#E2E8F0' : '#C2410C'} />
        </svg>
      );

    // Level 7: Two-Piece House Puzzle (200x200 split vertically at y=100)
    case 'house-top':
      return (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="4" width="192" height="92" rx="8" fill="#FEE2E2" stroke="#DC2626" strokeDasharray="6 4" strokeWidth="3" /> : <HouseMasterScene />}
        </svg>
      );
    case 'house-bot':
      return (
        <svg viewBox="0 100 200 100" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="104" width="192" height="92" rx="8" fill="#FEF3C7" stroke="#D97706" strokeDasharray="6 4" strokeWidth="3" /> : <HouseMasterScene />}
        </svg>
      );

    // Level 8: Rocket Picture Strips (180x270 sliced in 3 strips)
    case 'rocket-strip-1':
      return (
        <svg viewBox="0 0 180 90" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="4" width="172" height="82" rx="6" fill="#E2E8F0" stroke="#64748B" strokeDasharray="6 4" strokeWidth="2.5" /> : <RocketMasterScene />}
        </svg>
      );
    case 'rocket-strip-2':
      return (
        <svg viewBox="0 90 180 90" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="94" width="172" height="82" rx="6" fill="#E2E8F0" stroke="#64748B" strokeDasharray="6 4" strokeWidth="2.5" /> : <RocketMasterScene />}
        </svg>
      );
    case 'rocket-strip-3':
      return (
        <svg viewBox="0 180 180 90" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="184" width="172" height="82" rx="6" fill="#E2E8F0" stroke="#64748B" strokeDasharray="6 4" strokeWidth="2.5" /> : <RocketMasterScene />}
        </svg>
      );

    // Level 9: Three-Piece Fish Puzzle (270x160 sliced into 3 columns)
    case 'fish-tail':
      return (
        <svg viewBox="0 0 90 160" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="4" width="82" height="152" rx="8" fill="#ECFEFF" stroke="#0891B2" strokeDasharray="6 4" strokeWidth="2.5" /> : <FishMasterScene />}
        </svg>
      );
    case 'fish-body':
      return (
        <svg viewBox="90 0 90 160" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="94" y="4" width="82" height="152" rx="8" fill="#ECFEFF" stroke="#0891B2" strokeDasharray="6 4" strokeWidth="2.5" /> : <FishMasterScene />}
        </svg>
      );
    case 'fish-head':
      return (
        <svg viewBox="180 0 90 160" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="184" y="4" width="82" height="152" rx="8" fill="#ECFEFF" stroke="#0891B2" strokeDasharray="6 4" strokeWidth="2.5" /> : <FishMasterScene />}
        </svg>
      );

    // Level 10: Four-Piece Tree Puzzle (240x240 exact 2x2 quadrants)
    case 'tree-tl':
      return (
        <svg viewBox="0 0 120 120" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="4" width="112" height="112" rx="6" fill="#DCFCE7" stroke="#16A34A" strokeDasharray="6 4" strokeWidth="2.5" /> : <TreeMasterScene />}
        </svg>
      );
    case 'tree-tr':
      return (
        <svg viewBox="120 0 120 120" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="124" y="4" width="112" height="112" rx="6" fill="#DCFCE7" stroke="#16A34A" strokeDasharray="6 4" strokeWidth="2.5" /> : <TreeMasterScene />}
        </svg>
      );
    case 'tree-bl':
      return (
        <svg viewBox="0 120 120 120" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="4" y="124" width="112" height="112" rx="6" fill="#FEF3C7" stroke="#B45309" strokeDasharray="6 4" strokeWidth="2.5" /> : <TreeMasterScene />}
        </svg>
      );
    case 'tree-br':
      return (
        <svg viewBox="120 120 120 120" preserveAspectRatio="none" className={className} aria-hidden="true">
          {silhouette ? <rect x="124" y="124" width="112" height="112" rx="6" fill="#FEF3C7" stroke="#B45309" strokeDasharray="6 4" strokeWidth="2.5" /> : <TreeMasterScene />}
        </svg>
      );

    // Level 11: Planting Sequence Steps
    case 'seq-seed':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M14 78 Q50 54 86 78 Z" fill="#78350F" />
          <path d="M50 28 C40 42 40 58 50 62 C60 58 60 42 50 28 Z" fill="#D97706" stroke="#92400E" strokeWidth="2.5" />
          <path d="M50 14 L50 24 M44 20 L50 25 L56 20" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'seq-water':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="24" y="34" width="38" height="30" rx="6" fill="#0284C7" />
          <path d="M24 38 C12 38 12 58 24 58" fill="none" stroke="#0369A1" strokeWidth="5" />
          <line x1="60" y1="42" x2="78" y2="28" stroke="#0284C7" strokeWidth="7" strokeLinecap="round" />
          <path d="M82 40 C78 48 86 52 82 40 Z" fill="#38BDF8" />
          <circle cx="80" cy="56" r="4" fill="#38BDF8" />
          <circle cx="74" cy="70" r="4" fill="#38BDF8" />
          <circle cx="86" cy="72" r="4" fill="#38BDF8" />
        </svg>
      );
    case 'seq-sprout':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <path d="M14 82 Q50 58 86 82 Z" fill="#78350F" />
          <path d="M50 74 L50 38" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 44 C32 28 18 38 26 52 C34 58 46 50 50 44 Z" fill="#22C55E" />
          <path d="M50 44 C68 28 82 38 74 52 C66 58 54 50 50 44 Z" fill="#16A34A" />
          <circle cx="50" cy="24" r="10" fill="#F43F5E" />
          <circle cx="50" cy="24" r="4" fill="#FACC15" />
        </svg>
      );

    // Level 12: SmartTech Lab Master Scene Pieces
    case 'lab-cpu':
      return (
        <svg viewBox="0 0 110 90" className={className} aria-hidden="true">
          <rect x="14" y="12" width="82" height="54" rx="6" fill={silhouette ? '#CBD5E1' : '#0F172A'} stroke={silhouette ? '#94A3B8' : '#334155'} strokeWidth="3" />
          {!silhouette && (
            <>
              <rect x="22" y="20" width="66" height="38" rx="3" fill="#0284C7" />
              <path d="M32 38 L44 38 L50 30 L58 46 L64 38 L78 38" fill="none" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          <rect x="46" y="66" width="18" height="10" fill={silhouette ? '#94A3B8' : '#475569'} />
          <rect x="30" y="76" width="50" height="7" rx="3" fill={silhouette ? '#94A3B8' : '#334155'} />
        </svg>
      );
    case 'lab-robot':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="28" y="14" width="44" height="34" rx="10" fill={silhouette ? '#CBD5E1' : '#DC2626'} />
          <rect x="35" y="23" width="30" height="14" rx="5" fill={silhouette ? '#94A3B8' : '#0F172A'} />
          {!silhouette && (
            <>
              <circle cx="44" cy="30" r="3" fill="#38BDF8" />
              <circle cx="56" cy="30" r="3" fill="#38BDF8" />
            </>
          )}
          <rect x="24" y="52" width="52" height="34" rx="8" fill={silhouette ? '#CBD5E1' : '#E2E8F0'} stroke={silhouette ? '#94A3B8' : '#475569'} strokeWidth="2.5" />
          <circle cx="50" cy="68" r="7" fill={silhouette ? '#94A3B8' : '#F59E0B'} />
        </svg>
      );
    case 'lab-circuit':
      return (
        <svg viewBox="0 0 110 90" className={className} aria-hidden="true">
          <rect x="12" y="16" width="86" height="58" rx="8" fill={silhouette ? '#CBD5E1' : '#065F46'} stroke={silhouette ? '#94A3B8' : '#047857'} strokeWidth="3" />
          {!silhouette && (
            <>
              <rect x="38" y="32" width="34" height="24" rx="3" fill="#0F172A" />
              <line x1="22" y1="38" x2="38" y2="38" stroke="#FACC15" strokeWidth="3" />
              <line x1="22" y1="50" x2="38" y2="50" stroke="#FACC15" strokeWidth="3" />
              <line x1="72" y1="38" x2="88" y2="38" stroke="#FACC15" strokeWidth="3" />
              <line x1="72" y1="50" x2="88" y2="50" stroke="#FACC15" strokeWidth="3" />
              <circle cx="22" cy="38" r="4" fill="#38BDF8" />
              <circle cx="88" cy="50" r="4" fill="#EF4444" />
            </>
          )}
        </svg>
      );
    case 'lab-star':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <circle cx="50" cy="50" r="38" fill={silhouette ? '#E2E8F0' : '#FEF3C7'} stroke={silhouette ? '#94A3B8' : '#D97706'} strokeWidth="3" />
          <polygon points="50,20 58,40 80,42 63,56 68,78 50,66 32,78 37,56 20,42 42,40" fill={silhouette ? '#94A3B8' : '#F59E0B'} />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          <rect x="14" y="14" width="72" height="72" rx="16" fill={silhouette ? '#CBD5E1' : '#DC2626'} />
          <circle cx="50" cy="50" r="18" fill={silhouette ? '#94A3B8' : '#FFFFFF'} opacity="0.85" />
        </svg>
      );
  }
};
