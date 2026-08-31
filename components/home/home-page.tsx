import { DifferenceSection } from "@/components/home/sections/difference-section";
import { FinalCtaSection } from "@/components/home/sections/final-cta-section";
import { HeroSection } from "@/components/home/sections/hero-section";
import { ManagementSection } from "@/components/home/sections/management-section";
import { ObjectionSection } from "@/components/home/sections/objection-section";
import { ProblemSection } from "@/components/home/sections/problem-section";
import { ProcessSection } from "@/components/home/sections/process-section";
import { ProjectsSection } from "@/components/home/sections/projects-section";
import { SolutionsSection } from "@/components/home/sections/solutions-section";
import { StructureSection } from "@/components/home/sections/structure-section";
import { TechnicalSection } from "@/components/home/sections/technical-section";
import { ValueSection } from "@/components/home/sections/value-section";

export function HomePage() {
  return (
    <main id="conteudo">
      <HeroSection />
      <ProblemSection />
      <ValueSection />
      <StructureSection />
      <SolutionsSection />
      <TechnicalSection />
      <ManagementSection />
      <ProcessSection />
      <DifferenceSection />
      <ProjectsSection />
      <ObjectionSection />
      <FinalCtaSection />
    </main>
  );
}
