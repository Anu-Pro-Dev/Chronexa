"use client";
import { useState, useEffect, useRef } from "react";

// ── Count-up animation (integer) ────────────────────────────────────────────

export function useCountUpInt(target: Record<string, number>, ready: boolean) {
  const keys = Object.keys(target);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0])),
  );
  const rafRef = useRef<number | null>(null);
  const targetStr = JSON.stringify(target);

  useEffect(() => {
    setValues(Object.fromEntries(keys.map((k) => [k, 0])));
    if (!ready) return;

    const startTime = Date.now();
    const duration = 800;
    const snapshot = { ...target };

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValues(
        Object.fromEntries(
          Object.entries(snapshot).map(([k, v]) => [k, Math.floor(v * progress)]),
        ),
      );
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, targetStr]);

  return values;
}

// ── Count-up animation (float, 1 decimal) ───────────────────────────────────

export function useCountUpFloat(target: Record<string, number>, ready: boolean) {
  const keys = Object.keys(target);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0])),
  );
  const rafRef = useRef<number | null>(null);
  const targetStr = JSON.stringify(target);

  useEffect(() => {
    setValues(Object.fromEntries(keys.map((k) => [k, 0])));
    if (!ready) return;

    const startTime = Date.now();
    const duration = 800;
    const snapshot = { ...target };

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValues(
        Object.fromEntries(
          Object.entries(snapshot).map(([k, v]) => [k, parseFloat((v * progress).toFixed(1))]),
        ),
      );
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, targetStr]);

  return values;
}
