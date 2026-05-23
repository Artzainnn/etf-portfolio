import { notFound } from "next/navigation";
import { getPortfolio } from "@/lib/data/portfolios";
import { listEtfs } from "@/lib/data/etfs";
import { PortfolioEditor } from "@/components/portfolio-editor";

export const dynamic = "force-dynamic";

export default async function PortfolioEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!isFinite(id) || id <= 0) notFound();

  const [portfolio, allEtfs] = await Promise.all([
    getPortfolio(id),
    listEtfs(),
  ]);

  if (!portfolio) notFound();

  return <PortfolioEditor portfolio={portfolio} allEtfs={allEtfs} />;
}
