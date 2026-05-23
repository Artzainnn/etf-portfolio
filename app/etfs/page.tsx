import { listEtfs } from "@/lib/data/etfs";
import { EtfsExplorer } from "@/components/etfs-explorer";

export const dynamic = "force-dynamic";

export default async function EtfsPage() {
  const etfs = await listEtfs();
  return <EtfsExplorer etfs={etfs} />;
}
