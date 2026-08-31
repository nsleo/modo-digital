import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "status";
};

export function Badge({
  children,
  className = "",
  variant = "default",
}: BadgeProps) {
  return (
    <span className={["badge", `badge--${variant}`, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
