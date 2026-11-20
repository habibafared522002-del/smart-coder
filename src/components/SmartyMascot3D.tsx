import React, { useEffect, useState } from 'react';

export type SmartyAction =
  | 'greeting'
  | 'pointing'
  | 'thinking'
  | 'celebrating'
  | 'encouraging'
  | 'victory';

export type SmartyMood = 'happy' | 'excited' | 'thinking' | 'encouraging';

/**
 * Dynamic gameplay state prop requested for sub-region & variation mapping of the 3D robot asset.
 */
export type SmartyGameplayState =
  | 'thinking'
  | 'cheering'
  | 'pointing'
  | 'error'
  | 'retry'
  | 'greeting'
  | 'victory';

export interface SmartySubRegionVariation {
  stateKey: SmartyGameplayState;
  action: SmartyAction;
  /** CSS clip/crop & focal transform targeting specific sub-regions of the 3D robot asset */
  subRegionView: 'head_visor' | 'waving_upper' | 'full_hero' | 'chest_diagnostic';
  imageTransform: string;
  visorOverlayColor: string;
  visorExpression: 'question_matrix' | 'star_cheering' | 'target_laser' | 'amber_diagnostic' | 'smile_wave';
  wristBeaconColor: string;
  label: { ar: string; en: string };
}

/**
 * Explicit mapping of gameplay states (`thinking`, `cheering`, `pointing`, `error`/`retry`, `greeting`, `victory`)
 * to specific sub-regions and dynamic visual variations of the official 3D SmartTech robot asset.
 */
export const SMARTY_STATE_VARIATION_MAP: Record<SmartyGameplayState, SmartySubRegionVariation> = {
  thinking: {
    stateKey: 'thinking',
    action: 'thinking',
    subRegionView: 'head_visor',
    imageTransform: 'scale(1.16) translateY(5%) rotateZ(-3deg)',
    visorOverlayColor: 'rgba(251, 191, 36, 0.24)',
    visorExpression: 'question_matrix',
    wristBeaconColor: '#FBBF24',
    label: { ar: 'وضع التفكير والتحليل', en: 'Thinking & Analyzing' },
  },
  cheering: {
    stateKey: 'cheering',
    action: 'celebrating',
    subRegionView: 'full_hero',
    imageTransform: 'scale(1.06) translateY(-4%)',
    visorOverlayColor: 'rgba(16, 185, 129, 0.28)',
    visorExpression: 'star_cheering',
    wristBeaconColor: '#10B981',
    label: { ar: 'وضع الاحتفال والتشجيع', en: 'Cheering & Celebrating' },
  },
  pointing: {
    stateKey: 'pointing',
    action: 'pointing',
    subRegionView: 'waving_upper',
    imageTransform: 'scale(1.12) translate(-3%, 3%) rotateY(10deg)',
    visorOverlayColor: 'rgba(56, 189, 248, 0.25)',
    visorExpression: 'target_laser',
    wristBeaconColor: '#38BDF8',
    label: { ar: 'وضع التوجيه والإشارة', en: 'Pointing & Guiding' },
  },
  error: {
    stateKey: 'error',
    action: 'encouraging',
    subRegionView: 'chest_diagnostic',
    imageTransform: 'scale(1.1) translateY(2%)',
    visorOverlayColor: 'rgba(249, 115, 22, 0.28)',
    visorExpression: 'amber_diagnostic',
    wristBeaconColor: '#F97316',
    label: { ar: 'وضع التنبيه وإعادة المحاولة', en: 'Diagnostic & Retry' },
  },
  retry: {
    stateKey: 'retry',
    action: 'encouraging',
    subRegionView: 'chest_diagnostic',
    imageTransform: 'scale(1.1) translateY(2%)',
    visorOverlayColor: 'rgba(249, 115, 22, 0.28)',
    visorExpression: 'amber_diagnostic',
    wristBeaconColor: '#F97316',
    label: { ar: 'وضع التشجيع لإعادة المحاولة', en: 'Encouraging Retry' },
  },
  greeting: {
    stateKey: 'greeting',
    action: 'greeting',
    subRegionView: 'full_hero',
    imageTransform: 'scale(1)',
    visorOverlayColor: 'rgba(239, 68, 68, 0.18)',
    visorExpression: 'smile_wave',
    wristBeaconColor: '#EF4444',
    label: { ar: 'وضع الترحيب بالبطل', en: 'Hero Greeting' },
  },
  victory: {
    stateKey: 'victory',
    action: 'victory',
    subRegionView: 'full_hero',
    imageTransform: 'scale(1.08) translateY(-5%)',
    visorOverlayColor: 'rgba(250, 204, 21, 0.32)',
    visorExpression: 'star_cheering',
    wristBeaconColor: '#FACC15',
    label: { ar: 'وضع الانتصار الكبير', en: 'Grand Victory' },
  },
};

export interface SmartyMascot3DProps {
  /** Primary expression / movement state */
  action?: SmartyAction;
  /** Explicit gameplay state mapped to sub-regions & variations ('thinking' | 'cheering' | 'pointing' | 'error' | 'retry') */
  state?: SmartyGameplayState;
  /** Optional sub-region framing override */
  subRegionFocus?:
    | 'auto'
    | 'full'
    | 'visor'
    | 'upper_body'
    | 'head_visor'
    | 'waving_upper'
    | 'full_hero'
    | 'chest_diagnostic';
  /** Legacy compatibility mood prop mapped automatically to action */
  mood?: SmartyMood;
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  /** Optional pointing direction when action === 'pointing' */
  pointDirection?: 'left' | 'right' | 'up' | 'down';
  /** Whether to show the floating expression badge */
  showBadge?: boolean;
  /** Alias for showBadge */
  showStateBadge?: boolean;
  /** Language for optional badge tooltip */
  lang?: 'ar' | 'en';
  /** Alias for lang */
  language?: 'ar' | 'en';
  /** Additional wrapper classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Exact path to the user's uploaded official SmartTech Robot character image.
 */
export const OFFICIAL_SMARTY_ROBOT_SRC = '/assets/aistudio/________________8914cd32.jpg';

let cachedTransparentDataUrl: string | null = null;
let processingPromise: Promise<string> | null = null;

/**
 * Flood-fill outer pure-white studio background removal so the robot's
 * interior white helmet, white chest armor, and SmartTech Training Center
 * emblem remain 100% opaque and crisp while outer white corners become transparent.
 */
function getTransparentRobotImage(src: string): Promise<string> {
  if (cachedTransparentDataUrl) {
    return Promise.resolve(cachedTransparentDataUrl);
  }
  if (processingPromise) {
    return processingPromise;
  }

  processingPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxDim = 680;
        const scale = Math.min(
          1,
          maxDim / Math.max(img.naturalWidth || 680, img.naturalHeight || 680)
        );
        const w = Math.max(1, Math.round((img.naturalWidth || 680) * scale));
        const h = Math.max(1, Math.round((img.naturalHeight || 680) * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const isOuterBackground = (idx: number) => {
          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          const minC = Math.min(r, g, b);
          const maxC = Math.max(r, g, b);
          const saturation = maxC - minC;
          return minC >= 236 && saturation <= 18;
        };

        const pushIfBg = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const idx = y * w + x;
          if (visited[idx]) return;
          if (isOuterBackground(idx)) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        for (let x = 0; x < w; x++) {
          pushIfBg(x, 0);
          pushIfBg(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          pushIfBg(0, y);
          pushIfBg(w - 1, y);
        }

        while (head < tail) {
          const curr = queue[head++];
          const cx = curr % w;
          const cy = (curr / w) | 0;

          if (cx > 0) pushIfBg(cx - 1, cy);
          if (cx + 1 < w) pushIfBg(cx + 1, cy);
          if (cy > 0) pushIfBg(cx, cy - 1);
          if (cy + 1 < h) pushIfBg(cx, cy + 1);
        }

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            const p = idx * 4;
            if (visited[idx]) {
              data[p + 3] = 0;
            } else {
              const hasBgNeighbor =
                (x > 0 && visited[idx - 1]) ||
                (x + 1 < w && visited[idx + 1]) ||
                (y > 0 && visited[idx - w]) ||
                (y + 1 < h && visited[idx + w]);
              if (hasBgNeighbor) {
                const r = data[p];
                const g = data[p + 1];
                const b = data[p + 2];
                const lum = (r + g + b) / 3;
                if (lum > 225) {
                  data[p + 3] = Math.max(40, Math.round((255 - lum) * 6));
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        cachedTransparentDataUrl = canvas.toDataURL('image/png');
        resolve(cachedTransparentDataUrl);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

  return processingPromise;
}

const SIZE_CLASSES: Record<NonNullable<SmartyMascot3DProps['size']>, string> = {
  xs: 'w-9 h-9',
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
  hero: 'w-52 h-52 sm:w-64 sm:h-64',
};

const ACTION_CONFIG: Record<
  SmartyAction,
  {
     mappedState: SmartyGameplayState;
    badgeIcon: string;
    labelAr: string;
    labelEn: string;
    glowColor: string;
    rimShadow: string;
    motionStyle: React.CSSProperties;
  }
> = {
  greeting: {
    mappedState: 'greeting',
    badgeIcon: '👋',
    labelAr: 'مرحباً يا بطل!',
    labelEn: 'Hello Hero!',
    glowColor: 'from-rose-500/30 via-sky-400/20 to-transparent',
    rimShadow: 'drop-shadow(0 10px 18px rgba(239,68,68,0.28)) drop-shadow(0 4px 8px rgba(15,23,42,0.45))',
    motionStyle: {
      animation: 'smartyFloatGreeting 3.2s ease-in-out infinite',
    },
  },
  pointing: {
    mappedState: 'pointing',
    badgeIcon: '👉',
    labelAr: 'انظر إلى هذا الاتجاه!',
    labelEn: 'Look this way!',
    glowColor: 'from-cyan-400/35 via-blue-500/20 to-transparent',
    rimShadow: 'drop-shadow(0 10px 18px rgba(56,189,248,0.35)) drop-shadow(0 4px 8px rgba(15,23,42,0.45))',
    motionStyle: {
      animation: 'smartyPointingPulse 1.8s ease-in-out infinite',
    },
  },
  thinking: {
    mappedState: 'thinking',
    badgeIcon: '💡',
    labelAr: 'هيا نفكر معاً...',
    labelEn: "Let's think...",
    glowColor: 'from-amber-400/35 via-purple-500/20 to-transparent',
    rimShadow: 'drop-shadow(0 10px 18px rgba(251,191,36,0.32)) drop-shadow(0 4px 8px rgba(15,23,42,0.45))',
    motionStyle: {
      animation: 'smartyThinkingTilt 2.6s ease-in-out infinite',
    },
  },
  celebrating: {
    mappedState: 'cheering',
    badgeIcon: '🌟',
    labelAr: 'إجابة رائعة!',
    labelEn: 'Awesome Answer!',
    glowColor: 'from-emerald-400/40 via-yellow-400/25 to-transparent',
    rimShadow: 'drop-shadow(0 12px 22px rgba(16,185,129,0.42)) drop-shadow(0 4px 10px rgba(234,179,8,0.35))',
    motionStyle: {
      animation: 'smartyCelebrateBounce 1.1s ease-in-out infinite',
    },
  },
  encouraging: {
    mappedState: 'retry',
    badgeIcon: '💪',
    labelAr: 'حاول مرة أخرى، أنت تستطيع!',
    labelEn: 'Try again, you can do it!',
    glowColor: 'from-orange-400/35 via-rose-500/25 to-transparent',
    rimShadow: 'drop-shadow(0 10px 18px rgba(249,115,22,0.35)) drop-shadow(0 4px 8px rgba(15,23,42,0.45))',
    motionStyle: {
      animation: 'smartyEncourageNod 1.9s ease-in-out infinite',
    },
  },
  victory: {
    mappedState: 'victory',
    badgeIcon: '🏆',
    labelAr: 'انتصار ساحق!',
    labelEn: 'Grand Victory!',
    glowColor: 'from-yellow-300/50 via-amber-500/30 to-rose-500/20',
    rimShadow: 'drop-shadow(0 14px 26px rgba(250,204,21,0.55)) drop-shadow(0 4px 12px rgba(239,68,68,0.38))',
    motionStyle: {
      animation: 'smartyVictoryHero 1.4s ease-in-out infinite',
    },
  },
};

export const SmartyMascot3D: React.FC<SmartyMascot3DProps> = ({
  action,
  state,
  subRegionFocus = 'full',
  mood,
  size = 'md',
  pointDirection = 'right',
  showBadge,
  showStateBadge,
  lang,
  language,
  className = '',
  onClick,
}) => {
  const effectiveLang = language || lang || 'ar';
  const effectiveShowBadge = showStateBadge !== undefined ? showStateBadge : showBadge !== undefined ? showBadge : true;
  const [processedSrc, setProcessedSrc] = useState<string>(
    cachedTransparentDataUrl || OFFICIAL_SMARTY_ROBOT_SRC
  );

  useEffect(() => {
    let mounted = true;
    getTransparentRobotImage(OFFICIAL_SMARTY_ROBOT_SRC).then((url) => {
      if (mounted && url) {
        setProcessedSrc(url);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Resolve final action from `state`, `action`, or legacy `mood`
  const resolvedAction: SmartyAction = state
    ? SMARTY_STATE_VARIATION_MAP[state].action
    : action ||
      (mood === 'excited'
        ? 'celebrating'
        : mood === 'thinking'
        ? 'thinking'
        : mood === 'encouraging'
        ? 'encouraging'
        : 'greeting');

  const cfg = ACTION_CONFIG[resolvedAction];
  const resolvedGameplayState: SmartyGameplayState = state || cfg.mappedState;
  const subRegionVar = SMARTY_STATE_VARIATION_MAP[resolvedGameplayState];
  const sizeClass = SIZE_CLASSES[size];

  const pointerArrow =
    pointDirection === 'left'
      ? '👈'
      : pointDirection === 'up'
      ? '👆'
      : pointDirection === 'down'
      ? '👇'
      : '👉';

  const dynamicFocusTransform =
    subRegionFocus === 'visor' || subRegionFocus === 'head_visor'
      ? 'scale(1.22) translateY(8%)'
      : subRegionFocus === 'upper_body' || subRegionFocus === 'waving_upper'
      ? 'scale(1.12) translateY(4%)'
      : subRegionFocus === 'chest_diagnostic'
      ? 'scale(1.14) translateY(2%)'
      : subRegionFocus === 'auto'
      ? subRegionVar.imageTransform
      : 'scale(1)';

  return (
    <div
      onClick={onClick}
      data-testid="smarty-mascot-3d"
      data-mascot-action={resolvedAction}
      data-mascot-state={resolvedGameplayState}
      data-mascot-subregion={subRegionVar.subRegionView}
      data-mascot-source={OFFICIAL_SMARTY_ROBOT_SRC}
      title={effectiveLang === 'ar' ? subRegionVar.label.ar : subRegionVar.label.en}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${sizeClass} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ perspective: '900px' }}
    >
      <style>{`
        @keyframes smartyFloatGreeting {
          0%, 100% { transform: translateY(0px) rotateY(-4deg) rotateZ(0deg) scale(1); }
          50% { transform: translateY(-6px) rotateY(6deg) rotateZ(2deg) scale(1.03); }
        }
        @keyframes smartyPointingPulse {
          0%, 100% { transform: translateX(0px) rotateY(8deg) scale(1); }
          50% { transform: translateX(5px) rotateY(15deg) scale(1.04); }
        }
        @keyframes smartyThinkingTilt {
          0%, 100% { transform: translateY(0px) rotateZ(-4deg) rotateX(4deg); }
          50% { transform: translateY(-4px) rotateZ(5deg) rotateX(-3deg); }
        }
        @keyframes smartyCelebrateBounce {
          0%, 100% { transform: translateY(0px) scale(1) rotateZ(0deg); }
          35% { transform: translateY(-10px) scale(1.07) rotateZ(-4deg); }
          70% { transform: translateY(-6px) scale(1.05) rotateZ(4deg); }
        }
        @keyframes smartyEncourageNod {
          0%, 100% { transform: translateY(0px) scale(1); }
          40% { transform: translateY(-4px) scale(1.04) rotateX(8deg); }
          75% { transform: translateY(1px) scale(0.99) rotateX(-4deg); }
        }
        @keyframes smartyVictoryHero {
          0%, 100% { transform: translateY(0px) scale(1) rotateY(0deg); }
          50% { transform: translateY(-11px) scale(1.09) rotateY(12deg); }
        }
      `}</style>

      {/* 3D Volumetric Backlight Aura */}
      <div
        className={`absolute inset-1 rounded-full bg-radial ${cfg.glowColor} blur-md pointer-events-none transition-all duration-500`}
      />

      {/* 3D Ground Contact Shadow */}
      <div
        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3/4 h-2.5 rounded-full bg-black/35 blur-[3px] pointer-events-none"
      />

      {/* Main 3D-Styled Uploaded Robot Character (Aspect Ratio 100% Preserved via object-contain) */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-visible"
        style={{
          ...cfg.motionStyle,
          transformStyle: 'preserve-3d',
          filter: cfg.rimShadow,
        }}
      >
        <img
          src={processedSrc}
          data-original-src={OFFICIAL_SMARTY_ROBOT_SRC}
          alt="SmartTech 3D Robot Mascot"
          className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300"
          style={{ transform: dynamicFocusTransform }}
          draggable={false}
        />

        {/* Sub-Region 1: Dynamic Head Visor Holographic LED Matrix Overlay (Top 28% of 3D Robot) */}
        <div
          data-testid="smarty-visor-subregion"
          className="absolute top-[19%] left-[33%] w-[34%] h-[19%] rounded-full pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(circle, ${subRegionVar.visorOverlayColor} 0%, transparent 75%)`,
          }}
        />

        {/* Sub-Region 2: Dynamic Right-Wrist Smart Beacon Node (Middle-Left 54% of 3D Robot) */}
        <span
          data-testid="smarty-wrist-subregion"
          className="absolute top-[54%] left-[25%] w-2 h-2 rounded-full pointer-events-none animate-ping"
          style={{ backgroundColor: subRegionVar.wristBeaconColor, opacity: 0.75 }}
        />

        {/* Sub-Region 3: Dynamic Waving Left-Hand Energy Spark (Upper-Right of 3D Robot) */}
        {(resolvedGameplayState === 'cheering' ||
          resolvedGameplayState === 'pointing' ||
          resolvedGameplayState === 'victory') && (
          <span
            data-testid="smarty-hand-subregion"
            className="absolute top-[26%] right-[16%] w-2.5 h-2.5 rounded-full pointer-events-none animate-pulse"
            style={{
              backgroundColor: subRegionVar.wristBeaconColor,
              boxShadow: `0 0 10px ${subRegionVar.wristBeaconColor}`,
            }}
          />
        )}
      </div>

      {/* Expression / Action Indicator Badge */}
      {effectiveShowBadge && size !== 'xs' && (
        <span
          className="absolute -top-1 -right-1 z-10 flex items-center justify-center rounded-full bg-slate-900/90 border border-white/25 shadow-lg text-xs sm:text-sm w-6 h-6 sm:w-7 sm:h-7 animate-bounce pointer-events-none"
          aria-hidden="true"
        >
          {resolvedAction === 'pointing' ? pointerArrow : cfg.badgeIcon}
        </span>
      )}
    </div>
  );
};

export default SmartyMascot3D;
