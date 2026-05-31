import { listEtfs } from "@/lib/data/etfs";
import { listStocks } from "@/lib/data/stocks";
import { PortfolioEditor } from "@/components/portfolio-editor";

export default async function PortfolioEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [allEtfs, allStocks] = await Promise.all([listEtfs(), listStocks()]);
  return (
    <PortfolioEditor portfolioId={id} allEtfs={allEtfs} allStocks={allStocks} />
  );
}
