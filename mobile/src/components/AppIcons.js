import React from "react";
import Svg, { Path, Polyline, Rect, Circle, Line } from "react-native-svg";

const defaultStroke = 1.8;

export const MenuIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
    <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
    <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
  </Svg>
);

export const BellIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 17H5c1.2-1.2 2-2.9 2-4.7V9a5 5 0 0 1 10 0v3.3c0 1.8.8 3.5 2 4.7h-2"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 17a2 2 0 0 0 4 0"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="3.25" stroke={color} strokeWidth={defaultStroke} />
    <Path
      d="M5.5 19.2c1.7-3.4 4.2-5.1 6.5-5.1s4.8 1.7 6.5 5.1"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinecap="round"
    />
  </Svg>
);

export const HomeIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11.5 12 5l8 6.5"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 10.8V19h11V10.8"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GridIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.6" stroke={color} strokeWidth={defaultStroke} />
    <Rect x="13" y="4.5" width="6.5" height="6.5" rx="1.6" stroke={color} strokeWidth={defaultStroke} />
    <Rect x="4.5" y="13" width="6.5" height="6.5" rx="1.6" stroke={color} strokeWidth={defaultStroke} />
    <Rect x="13" y="13" width="6.5" height="6.5" rx="1.6" stroke={color} strokeWidth={defaultStroke} />
  </Svg>
);

export const HeartIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinejoin="round"
    />
  </Svg>
);

export const InboxIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 6.5h15v10h-4.2l-1.7 2h-3.2l-1.7-2H4.5z"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinejoin="round"
    />
    <Path d="M4.5 10.5h4.8l1.2 2h2.9l1.2-2h4.9" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4.5" y="5.5" width="15" height="14" rx="2" stroke={color} strokeWidth={defaultStroke} />
    <Path d="M8 4v3M16 4v3M4.5 9h15" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
  </Svg>
);

export const SearchIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10.5" cy="10.5" r="5.75" stroke={color} strokeWidth={defaultStroke} />
    <Path d="M15 15l4.5 4.5" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
  </Svg>
);

export const EditIcon = ({ color = "currentColor", size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 19.5h4.8L19.5 9.3l-4.8-4.8L4.5 14.7z"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinejoin="round"
    />
    <Path d="M13.5 6l4.5 4.5" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" />
  </Svg>
);

export const StarIcon = ({ color = "currentColor", size = 18, filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <Path
      d="m12 3.8 2.76 5.6 6.2.9-4.48 4.36 1.06 6.18L12 17.98l-5.54 2.86 1.06-6.18-4.48-4.36 6.2-.9L12 3.8Z"
      stroke={color}
      strokeWidth={defaultStroke}
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownIcon = ({ color = "currentColor", size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth={defaultStroke} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
