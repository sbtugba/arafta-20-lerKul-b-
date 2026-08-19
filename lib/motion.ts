import type { WithSpringConfig } from 'react-native-reanimated';

// apple-design skill §4 — damping ratio + response(ms), not duration-as-fixed-length.
// Reanimated's {duration, dampingRatio} spring config maps directly onto this model.

export const springs = {
  // Default: critically damped, no overshoot — repositioning, snapping back.
  move: { duration: 400, dampingRatio: 1 } satisfies WithSpringConfig,
  // Momentum-driven: only used when the gesture itself carried velocity (a drag, a flick).
  momentum: { duration: 380, dampingRatio: 0.86 } satisfies WithSpringConfig,
  // Quick, small-amplitude commit feedback (e.g. a tap that just landed).
  tap: { duration: 260, dampingRatio: 0.75 } satisfies WithSpringConfig,
};

// §9 — soft resistance past a boundary instead of a hard stop.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
