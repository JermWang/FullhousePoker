import { Composition } from "remotion";
import { FullhousePlatformPromo } from "./fullhouse-platform-promo";
import {
  FullhousePromo,
  PROMO_DURATION,
  PROMO_FPS,
  PROMO_W,
  PROMO_H,
} from "./fullhouse-promo";

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_DURATION_FRAMES = 810;

export const RemotionRoot = () => {
  return (
    <>
      {/* High-end hype promo — fast cuts, neon motion graphics, transitions. */}
      <Composition
        id="FullhousePromo"
        component={FullhousePromo}
        durationInFrames={PROMO_DURATION}
        fps={PROMO_FPS}
        width={PROMO_W}
        height={PROMO_H}
      />
      {/* Longer platform feature tour. */}
      <Composition
        id="FullhousePlatformPromo"
        component={FullhousePlatformPromo}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
