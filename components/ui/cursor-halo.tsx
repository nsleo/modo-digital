"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const interactiveSelector = [
  "a",
  "button",
  "[role='button']",
  "input",
  "textarea",
  "select",
  "[data-cursor='interactive']",
].join(", ");

export function CursorHalo() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const pointerX = useMotionValue(-160);
  const pointerY = useMotionValue(-160);
  const x = useSpring(pointerX, { stiffness: 280, damping: 26, mass: 0.35 });
  const y = useSpring(pointerY, { stiffness: 280, damping: 26, mass: 0.35 });

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const canUseFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches;

    if (!canUseFinePointer) {
      return;
    }

    setEnabled(true);

    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX - 18);
      pointerY.set(event.clientY - 18);
      setActive(true);
    };

    const handlePointerLeave = () => setActive(false);

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      setInteractive(Boolean(target.closest(interactiveSelector)));
    };

    const handlePointerDown = () => setInteractive(true);
    const handlePointerUp = () => setInteractive(false);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [pointerX, pointerY, reduceMotion]);

  if (!enabled) {
    return null;
  }

  return (
    <motion.div
      className={`cursor-halo ${active ? "cursor-halo--active" : ""} ${
        interactive ? "cursor-halo--interactive" : ""
      }`}
      style={{ x, y }}
      aria-hidden="true"
    />
  );
}
