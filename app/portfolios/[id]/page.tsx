import { listEtfs } from "@/lib/data/etfs";
import { PortfolioEditor } from "@/components/portfolio-editor";

export default async function PortfolioEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allEtfs = await listEtfs();
  return <PortfolioEditor portfolioId={id} allEtfs={allEtfs} />;
}
