import React from 'react';

export default function LogoIcon({ className = "w-32 h-32" }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Flat Luxury Gold */}
        <style>
          {`
            .gold {
              stroke: #B08B57;
              fill: #B08B57;
            }

            .line {
              fill: none;
              stroke: #B08B57;
              stroke-linecap: round;
              stroke-linejoin: round;
            }

            .softFill {
              fill: rgba(176, 139, 87, 0.08);
              stroke: #B08B57;
            }

            .bg {
              fill: #F6F1EB;
            }
          `}
        </style>
      </defs>

      {/* Optional Background */}
      {/* <rect width="500" height="500" className="bg" /> */}

      {/* Main Logo Group */}
      <g>

        {/* Elegant Circular Frame */}
        <path
          d="M145 385 A175 175 0 1 1 330 420"
          className="line"
          strokeWidth="1.8"
        />

        {/* Minimal Side Dots */}
        <circle cx="388" cy="248" r="2.5" className="gold" />
        <circle cx="382" cy="272" r="1.8" className="gold" />

        {/* Elegant Star */}
        <g transform="translate(355,135)">
          <path
            d="M0 -16 L0 16 M-16 0 L16 0"
            className="line"
            strokeWidth="1.5"
          />
          <path
            d="M-10 -10 L10 10 M-10 10 L10 -10"
            className="line"
            strokeWidth="1"
          />
        </g>

        {/* Crystal Cluster */}
        <g>

          {/* Main Crystal */}
          <path
            d="M145 375 L145 295 L165 270 L182 298 L178 350 Z"
            className="softFill"
            strokeWidth="1.5"
          />

          <path
            d="M145 295 L164 304 L165 270 M164 304 L182 298"
            className="line"
            strokeWidth="1.2"
          />

          {/* Side Crystal */}
          <path
            d="M112 392 L118 340 L136 325 L148 348 L138 378 Z"
            className="softFill"
            strokeWidth="1.2"
          />

          <path
            d="M118 340 L132 350 L136 325"
            className="line"
            strokeWidth="1"
          />

        </g>

        {/* Botanical Minimal Leaves */}
        <g>

          {/* Curved Stem */}
          <path
            d="M118 405 C150 428, 205 438, 250 422"
            className="line"
            strokeWidth="1.5"
          />

          {/* Leaf 1 */}
          <path
            d="M150 418 C142 432, 155 438, 165 423 C160 419, 155 416, 150 418 Z"
            className="softFill"
            strokeWidth="1"
          />

          {/* Leaf 2 */}
          <path
            d="M190 427 C190 442, 208 440, 205 424 Z"
            className="softFill"
            strokeWidth="1"
          />

          {/* Leaf 3 */}
          <path
            d="M225 424 C232 438, 248 432, 240 420 Z"
            className="softFill"
            strokeWidth="1"
          />

        </g>

        {/* Central Serif S */}
        <text
          x="245"
          y="285"
          fontFamily="'Cormorant Garamond', 'Playfair Display', serif"
          fontSize="190"
          fontWeight="300"
          fill="#B08B57"
          textAnchor="middle"
          dominantBaseline="middle"
          letterSpacing="1"
        >
          S
        </text>

      </g>
    </svg>
  );
}