import {
  Zap, Shield, Rocket, Star, Heart, Check, Sparkles, Globe, Lock, Gauge,
  Layers, Cloud, Code, Cpu, BarChart3, Users, Wand2, Palette, Bell, Mail,
  MessageCircle, Smile, Award, Target, TrendingUp, Clock, Calendar, MapPin,
  Phone, Camera, Play, Music, ShoppingBag, CreditCard, DollarSign, Gift,
  Coffee, Leaf, Flame, Sun, Moon, Compass, Diamond, Crown, Flag, Bookmark,
  Search, Settings, Wifi, Battery, Headphones, Monitor, Smartphone, Feather,
  type LucideIcon,
} from 'lucide-react'

/** Curated icon set the Icon block can render by name. */
export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap, shield: Shield, rocket: Rocket, star: Star, heart: Heart,
  check: Check, sparkles: Sparkles, globe: Globe, lock: Lock, gauge: Gauge,
  layers: Layers, cloud: Cloud, code: Code, cpu: Cpu, chart: BarChart3,
  users: Users, wand: Wand2, palette: Palette, bell: Bell, mail: Mail,
  message: MessageCircle, smile: Smile, award: Award, target: Target,
  trending: TrendingUp, clock: Clock, calendar: Calendar, pin: MapPin,
  phone: Phone, camera: Camera, play: Play, music: Music, bag: ShoppingBag,
  card: CreditCard, dollar: DollarSign, gift: Gift, coffee: Coffee,
  leaf: Leaf, flame: Flame, sun: Sun, moon: Moon, compass: Compass,
  diamond: Diamond, crown: Crown, flag: Flag, bookmark: Bookmark,
  search: Search, settings: Settings, wifi: Wifi, battery: Battery,
  headphones: Headphones, monitor: Monitor, mobile: Smartphone, feather: Feather,
}

export const ICON_OPTIONS = Object.keys(ICON_MAP).map((k) => ({
  label: k[0].toUpperCase() + k.slice(1),
  value: k,
}))

export function renderIcon(name: string, size: number, color?: string) {
  const Ico = ICON_MAP[name] ?? Sparkles
  return <Ico size={size} color={color} strokeWidth={2} absoluteStrokeWidth />
}
