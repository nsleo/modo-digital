"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Icon, type IconName } from "@/components/ui/icon";

const modules: Array<{
  label: string;
  icon: IconName;
  status: string;
  className: string;
}> = [
  { label: "Site", icon: "window", status: "online", className: "module--site" },
  { label: "E-mail", icon: "clarity", status: "ativo", className: "module--email" },
  { label: "Domínio", icon: "structure", status: "seguro", className: "module--domain" },
  { label: "Suporte", icon: "continuity", status: "contínuo", className: "module--support" },
];

export function SystemVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 22 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className="system-visual"
      aria-label="Representação da estrutura digital organizada ao redor do negócio"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={
        reduceMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 1000 }
      }
    >
      <div className="system-visual__grid" aria-hidden="true" />
      <div className="system-visual__glow" aria-hidden="true" />
      <div className="system-visual__status">
        <span />
        Estrutura operando
      </div>

      <div className="system-core">
        <span className="system-core__label">Núcleo</span>
        <Image
          src="/brand/Modo_Digital_symbol_v2_gold_gradient.svg"
          alt=""
          width="76"
          height="76"
        />
        <strong>Teu negócio</strong>
        <small>no centro da estrutura</small>
      </div>

      <div className="system-ring system-ring--one" aria-hidden="true" />
      <div className="system-ring system-ring--two" aria-hidden="true" />

      {modules.map((item, index) => (
        <motion.div
          className={`system-module ${item.className}`}
          key={item.label}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{
            duration: 0.55,
            delay: 0.45 + index * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="system-module__icon">
            <Icon name={item.icon} width={16} height={16} />
          </span>
          <span>
            <strong>{item.label}</strong>
            <small>
              <i /> {item.status}
            </small>
          </span>
        </motion.div>
      ))}

      <div className="system-visual__metric">
        <span>Base digital</span>
        <strong>organizada</strong>
        <div>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </motion.div>
  );
}
