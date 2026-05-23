import { listPortfolios } from "@/lib/data/portfolios";
import { PortfoliosIndex } from "@/components/portfolios-index";

export const dynamic = "force-dynamic";

export default async function PortfoliosPage() {
  const portfolios = await listPortfolios();
  return <PortfoliosIndex portfolios={portfolios} />;
}
