import type { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  className: string;
  id?: string;
  containerClassName?: string;
};

export function SectionShell({
  children,
  className,
  id,
  containerClassName = "container",
}: SectionShellProps) {
  return (
    <section className={className} id={id}>
      <div className={containerClassName}>{children}</div>
    </section>
  );
}
