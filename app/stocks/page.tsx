import { listStocks } from "@/lib/data/stocks";
import { StocksExplorer } from "@/components/stocks-explorer";

export const dynamic = "force-dynamic";

export default async function StocksPage() {
  const stocks = await listStocks();
  return <StocksExplorer stocks={stocks} />;
}
