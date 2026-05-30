import { listStocks } from "@/lib/data/stocks";
import { StocksExplorer } from "@/components/stocks-explorer";

export const dynamic = "force-dynamic";

export default function StocksPage() {
  const stocks = listStocks();
  return <StocksExplorer stocks={stocks} />;
}
