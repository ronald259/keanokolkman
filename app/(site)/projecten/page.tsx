import CategoryGrid from "@/components/CategoryGrid";
import { getByCategory } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProjectenPage() {
  const items = await getByCategory("projecten");
  return <CategoryGrid title="Projecten" subtitle="Opdrachten, samenwerkingen en doorlopend werk." items={items} />;
}
