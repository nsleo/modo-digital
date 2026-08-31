import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { navigation, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Image
              src="/brand/Modo_Digital_logo_vertical_v2_outline_white.svg"
              alt="Modo Digital"
              width="72"
              height="122"
            />
            <p>{siteConfig.descriptor}</p>
          </div>

          <div className="site-footer__column">
            <p className="footer-label">Navegação</p>
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="footer-admin-link" href="/operacao">
              Painel admin
            </Link>
          </div>

          <div className="site-footer__column">
            <p className="footer-label">Contato</p>
            <div className="footer-actions" aria-label="Canais de contato">
              <a
                className="footer-action footer-action--whatsapp"
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="Conversar pelo WhatsApp"
                title="WhatsApp"
              >
                <Icon name="phone" width={18} height={18} />
              </a>
              <a
                className="footer-action footer-action--email"
                href={`mailto:${siteConfig.email}`}
                aria-label="Enviar e-mail"
                title="E-mail"
              >
                <Icon name="mail" width={18} height={18} />
              </a>
              <a
                className="footer-action footer-action--instagram"
                href={siteConfig.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Acessar Instagram"
                title="Instagram"
              >
                <Icon name="instagram" width={18} height={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} Modo Digital.</p>
          <div className="footer-origin">
            <span className="footer-origin__colors" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Rio Grande do Sul, Brasil</span>
          </div>
          <p>Estrutura para crescer. Clareza para continuar.</p>
        </div>
      </div>
    </footer>
  );
}
