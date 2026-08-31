import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function Eyebrow({
  children,
  className = "",
  centered = false,
}: EyebrowProps) {
  const classes = ["eyebrow", centered ? "eyebrow--center" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={classes}>
      <span aria-hidden="true" />
      {children}
      {centered ? <span aria-hidden="true" /> : null}
    </p>
  );
}
