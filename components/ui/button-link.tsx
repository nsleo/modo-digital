import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  showArrow?: boolean;
};

export function ButtonLink({
  children,
  variant = "primary",
  showArrow = true,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`button button--${variant} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {showArrow ? <Icon name="arrow" width={18} height={18} /> : null}
    </a>
  );
}
