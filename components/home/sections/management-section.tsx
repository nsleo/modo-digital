import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent, siteConfig } from "@/content/site";

export function ManagementSection() {
  return (
    <SectionShell className="section management-section" id="gestao-continua">
      <Reveal>
        <div className="management-panel">
          <div className="management-panel__glow" aria-hidden="true" />
          <div className="management-panel__copy">
            <Eyebrow>Gestão Contínua</Eyebrow>
            <h2>
              Estrutura digital não deve ser <span>entregue e esquecida.</span>
            </h2>
            <p>{homeContent.management.description}</p>
            <div className="management-panel__price">
              <span>A partir de</span>
              <strong>{homeContent.management.price}</strong>
              <small>/mês</small>
            </div>
            <ButtonLink
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Quero acompanhamento contínuo
            </ButtonLink>
          </div>

          <div className="management-panel__features">
            <div className="management-status">
              <div>
                <span className="status-pulse" />
                <span>
                  <small>{homeContent.management.statusTitle}</small>
                  <strong>{homeContent.management.statusValue}</strong>
                </span>
              </div>
              <Badge className="management-status__badge" variant="status">
                {homeContent.management.statusBadge}
              </Badge>
            </div>
            <ul>
              {homeContent.management.features.map((item) => (
                <li key={item}>
                  <span>
                    <Icon name="check" width={15} height={15} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p>{homeContent.management.footnote}</p>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
