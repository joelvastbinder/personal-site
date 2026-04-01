export function JVLogo() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
    >
      {/* Outer circular ring */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      
      {/* Inner geometric pattern - J shape */}
      <path
        d="M 12 8 L 12 18 Q 12 22 16 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* V shape */}
      <path
        d="M 18 8 L 20 16 L 22 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Connecting arc element */}
      <path
        d="M 14 10 Q 16 12 18 10"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
      />
      
      {/* Decorative dots */}
      <circle cx="16" cy="6" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="26" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
