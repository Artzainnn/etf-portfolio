/**
 * Industry metadata for individual stocks. The order here is the display
 * order in filter chips. Stocks can belong to multiple industries.
 */

export interface Industry {
  key: string;
  label: string;
  emoji: string;
}

export const INDUSTRIES: Industry[] = [
  { key: "big_tech", label: "Big Tech", emoji: "💻" },
  { key: "ai", label: "AI", emoji: "🤖" },
  { key: "chips", label: "Chips & semis", emoji: "💾" },
  { key: "saas", label: "Cloud / SaaS", emoji: "☁️" },
  { key: "ecommerce", label: "E-commerce", emoji: "🛒" },
  { key: "cars", label: "Cars & EV", emoji: "🚗" },
  { key: "energy", label: "Oil & gas", emoji: "🛢️" },
  { key: "clean_energy", label: "Clean energy", emoji: "☀️" },
  { key: "defense", label: "Defense", emoji: "🪖" },
  { key: "robotics", label: "Robotics", emoji: "🦾" },
  { key: "quantum", label: "Quantum", emoji: "⚛️" },
  { key: "pharma", label: "Pharma & biotech", emoji: "💊" },
  { key: "luxury", label: "Luxury", emoji: "💎" },
  { key: "travel", label: "Travel & hospitality", emoji: "✈️" },
  { key: "finance", label: "Finance & banks", emoji: "🏦" },
  { key: "singapore", label: "Singapore", emoji: "🇸🇬" },
];

export const INDUSTRY_LOOKUP: Map<string, Industry> = new Map(
  INDUSTRIES.map((i) => [i.key, i]),
);
