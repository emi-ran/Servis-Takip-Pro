interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 24 }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="58" height="58" rx="15" fill="#2563EB" />

      <g transform="translate(1.5 -2)">
        <path
          d="
            M42 18
            C37 15 29 15 24 18
            C20 20 18 23 19 26
            C20 30 24 31.5 30 33.5
            L35.5 35.2
            C43 37.5 46.5 41 45.5 46
            C44.3 52 38.3 55 31 55
            C25 55 20 53 17 50
          "
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="42" cy="18" r="5.4" fill="#FFFFFF" />

        <path d="M42 14.8L44.8 16.4V19.6L42 21.2L39.2 19.6V16.4Z" fill="#2563EB" />
      </g>
    </svg>
  );
}
