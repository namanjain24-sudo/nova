import {
  Zap,
  Shield,
  Rocket,
  Star,
  Heart,
  Check,
  Sparkles,
  Globe,
  Lock,
  Gauge,
  Layers,
  Cloud,
  Code,
  Cpu,
  BarChart3,
  Users,
  Wand2,
  Palette,
  Bell,
  Mail,
  MessageCircle,
  Smile,
  type LucideIcon,
} from 'lucide-react'

/** Curated icon set the Icon block can render by name. */
export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  check: Check,
  sparkles: Sparkles,
  globe: Globe,
  lock: Lock,
  gauge: Gauge,
  layers: Layers,
  cloud: Cloud,
  code: Code,
  cpu: Cpu,
  chart: BarChart3,
  users: Users,
  wand: Wand2,
  palette: Palette,
  bell: Bell,
  mail: Mail,
  message: MessageCircle,
  smile: Smile,
}

export const ICON_OPTIONS = Object.keys(ICON_MAP).map((k) => ({
  label: k[0].toUpperCase() + k.slice(1),
  value: k,
}))

export function renderIcon(name: string, size: number, color?: string) {
  const Ico = ICON_MAP[name] ?? Sparkles
  return <Ico size={size} color={color} strokeWidth={2} absoluteStrokeWidth />
}
