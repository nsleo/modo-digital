"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/content/site";

const CONTACT_ITEMS = [
  {
    href: siteConfig.whatsapp,
    label: "WhatsApp",
    icon: "phone" as const,
    className: "floating-contact__link--whatsapp",
    external: true,
  },
  {
    href: `mailto:${siteConfig.email}`,
    label: "E-mail",
    icon: "mail" as const,
    className: "floating-contact__link--email",
    external: false,
  },
  {
    href: siteConfig.instagram,
    label: "Instagram",
    icon: "instagram" as const,
    className: "floating-contact__link--instagram",
    external: true,
  },
] as const;

export function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`floating-contact ${open ? "floating-contact--open" : ""}`}>
      <div className="floating-contact__panel" aria-hidden={!open}>
        {CONTACT_ITEMS.map((item) => (
          <a
            key={item.label}
            className={`floating-contact__link ${item.className}`}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            <Icon name={item.icon} width={18} height={18} />
          </a>
        ))}
      </div>

      <button
        type="button"
        className="floating-contact__trigger"
        aria-label={open ? "Fechar atalhos de contato" : "Abrir atalhos de contato"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name={open ? "close" : "phone"} width={18} height={18} />
      </button>
    </div>
  );
}
