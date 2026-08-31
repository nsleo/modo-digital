import type { Metadata } from "next";
import { InternalOperationsPage } from "@/components/forms/internal-operations-page";

export const metadata: Metadata = {
  title: "Operação Interna",
  description: "Painel interno mínimo para operar leads da Modo Digital.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OperacaoPage() {
  return <InternalOperationsPage />;
}
