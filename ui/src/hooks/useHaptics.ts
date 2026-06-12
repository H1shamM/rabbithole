import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";

type Strength = "light" | "medium" | "heavy";

/**
 * Tactile feedback on native (no-op on web). Plugin is dynamically imported so
 * the web bundle never pulls in native code.
 */
export function useHaptics() {
  const impact = useCallback(async (strength: Strength = "light") => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      const style =
        strength === "heavy"
          ? ImpactStyle.Heavy
          : strength === "medium"
            ? ImpactStyle.Medium
            : ImpactStyle.Light;
      await Haptics.impact({ style });
    } catch {
      /* haptics are best-effort */
    }
  }, []);

  return { impact };
}
