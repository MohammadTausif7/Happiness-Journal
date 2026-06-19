import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function BrandMark({ size = 34, ...props }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 40 40"
      width={size}
      {...props}
    >
      <rect fill="url(#brand-gradient)" height="40" rx="13" width="40" />
      <path
        d="M11.5 20.5c2.3 5.65 14.7 5.65 17 0"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <circle cx="14.2" cy="15.5" fill="white" r="1.6" />
      <circle cx="25.8" cy="15.5" fill="white" r="1.6" />
      <path
        d="m27.8 7.2.65 1.4 1.4.65-1.4.65-.65 1.4-.65-1.4-1.4-.65 1.4-.65.65-1.4Z"
        fill="#FFF8C6"
      />
      <defs>
        <linearGradient
          id="brand-gradient"
          x1="3"
          x2="36"
          y1="3"
          y2="37"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFB755" />
          <stop offset=".5" stopColor="#F77991" />
          <stop offset="1" stopColor="#8B73E8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <BrandMark />
      <span>Happiness Journal</span>
    </span>
  );
}
