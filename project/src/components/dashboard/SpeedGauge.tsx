interface SpeedGaugeProps {
  label: string;
  value: number;
  max: number;
  tone: 'cyan' | 'blue';
}

const ARC_RADIUS = 80;
const ARC_LENGTH = Math.PI * ARC_RADIUS;

const TONE_STROKE: Record<SpeedGaugeProps['tone'], string> = {
  cyan: 'stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]',
  blue: 'stroke-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]',
};

export function SpeedGauge({ label, value, max, tone }: SpeedGaugeProps) {
  const ratio = Math.min(1, Math.max(0, value / max));
  const offset = ARC_LENGTH * (1 - ratio);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px]" role="img" aria-label={`${label}: ${value.toFixed(1)} ميجابت في الثانية`}>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className="stroke-slate-800"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
          className={`${TONE_STROKE[tone]} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
        <text x="100" y="82" textAnchor="middle" className="fill-slate-100 text-[26px] font-semibold tabular-nums">
          {value.toFixed(1)}
        </text>
        <text x="100" y="102" textAnchor="middle" className="fill-slate-400 text-[11px] uppercase tracking-widest">
          ميجابت/ث
        </text>
      </svg>
      <p className="mt-2 text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
}
