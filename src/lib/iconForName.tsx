import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Dumbbell,
  Footprints,
  Activity,
  Shield,
  Bone,
  Move3d,
  Apple,
  Flame,
  StretchVertical,
  StretchHorizontal,
  Wind,
} from "lucide-react";

/* ---- catalog for overrides ---- */
export const ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] =
  [
    { key: "dumbbell", label: "Arms / Shoulders", Icon: Dumbbell },
    { key: "footprints", label: "Legs / Lower body", Icon: Footprints },
    { key: "bone", label: "Back / Pull", Icon: Bone },
    { key: "shield", label: "Chest / Push", Icon: Shield },
    { key: "move3d", label: "Full Body / Glutes", Icon: Move3d },
    { key: "apple", label: "Core / Abs", Icon: Apple },
    { key: "activity", label: "Cardio / Conditioning", Icon: Activity },
    { key: "flame", label: "Combo / High Effort", Icon: Flame },
    { key: "stretchV", label: "Mobility (Vertical)", Icon: StretchVertical },
    {
      key: "stretchH",
      label: "Mobility (Horizontal)",
      Icon: StretchHorizontal,
    },
    { key: "wind", label: "Dynamic Warm-up", Icon: Wind },
  ];

const BY_KEY = Object.fromEntries(ICON_OPTIONS.map((o) => [o.key, o.Icon]));

/* ---- implied icon from name ---- */
function impliedIconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (
    /(mobility|warm[-\s]?up|warmup|stretch|flex(ibility)?|rom|range of motion)/.test(
      n
    )
  )
    return StretchVertical;
  if (/(leg|quad|ham|lower body)/.test(n)) return Footprints;
  if (/(arm|bicep|tricep|shoulder|delts?)/.test(n)) return Dumbbell;
  if (/(back|lat|row|pull)/.test(n)) return Bone;
  if (/(chest|pec|push)/.test(n)) return Shield;
  if (/(glute|booty|hip)/.test(n)) return Move3d;
  if (/(core|abs|abdom|midsection)/.test(n)) return Apple;
  if (/(cardio|condition|metcon|hiit)/.test(n)) return Activity;
  if (/(full|total|body|combo)/.test(n)) return Flame;
  return Dumbbell;
}

/* ---- main renderer (uses override if present) ---- */
export function IconForName({
  name,
  iconKey,
  className,
  ...rest
}: { name: string; iconKey?: string } & Omit<LucideProps, "ref">) {
  const Icon =
    iconKey && BY_KEY[iconKey] ? BY_KEY[iconKey] : impliedIconFor(name);
  return <Icon className={className} {...rest} />;
}
