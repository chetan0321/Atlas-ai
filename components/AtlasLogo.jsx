// Shared Atlas.AI logo — use this on every page for consistency
// Usage: <AtlasLogo size={22} />  or  <AtlasLogo size={18} textSize={16} />

export default function AtlasLogo({ size = 22, textSize, showText = true, style = {} }) {
  const ts = textSize || Math.round(size * 0.72)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.4) + 'px', ...style }}>
      {/* Geometric "A" — two diagonal legs + crossbar, white */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        {/* Left leg */}
        <path
          d="M2 20 L12 3 L22 20"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Crossbar */}
        <line
          x1="6.5"
          y1="13.5"
          x2="17.5"
          y2="13.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span style={{
          fontSize: ts + 'px',
          fontWeight: '700',
          color: '#fff',
          letterSpacing: '-0.3px',
          lineHeight: 1
        }}>
          Atlas.AI
        </span>
      )}
    </div>
  )
}
