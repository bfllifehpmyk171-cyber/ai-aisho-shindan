// reference-diagnosis.html のマスコットSVGをそのまま移植
export function MascotSVG({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="50" cy="88" rx="26" ry="6" fill="#E3D7C8" opacity="0.5" />
      <path d="M28 34 Q22 14 34 18 Q38 26 36 36 Z" fill="#B5677A" />
      <path d="M72 34 Q78 14 66 18 Q62 26 64 36 Z" fill="#B5677A" />
      <circle cx="50" cy="52" r="30" fill="#FBF6EF" stroke="#B5677A" strokeWidth="2.5" />
      <circle cx="40" cy="50" r="3.2" fill="#3A332E" />
      <circle cx="60" cy="50" r="3.2" fill="#3A332E" />
      <path
        d="M42 60 Q50 66 58 60"
        stroke="#3A332E"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="30" cy="58" r="4" fill="#F0DCE0" />
      <circle cx="70" cy="58" r="4" fill="#F0DCE0" />
      <path
        d="M78 30 L80 36 L86 38 L80 40 L78 46 L76 40 L70 38 L76 36 Z"
        fill="#8A9A7E"
      />
    </svg>
  );
}

export function Mascot({ message, size = 56 }: { message: string; size?: number }) {
  return (
    <div className="mascot-row">
      <MascotSVG size={size} />
      <div className="mascot-bubble">{message}</div>
    </div>
  );
}
