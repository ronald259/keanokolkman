import CategoryGrid from "@/components/CategoryGrid";
import { getByCategory } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AnimatiesPage() {
  const items = await getByCategory("animaties");
  return <CategoryGrid title="Animaties" subtitle="2D, 3D en stop-motion experimenten." items={items} />;
}
