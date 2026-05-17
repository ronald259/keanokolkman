import CategoryGrid from "@/components/CategoryGrid";
import { getByCategory } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function FotosPage() {
  const items = await getByCategory("fotos");
  return <CategoryGrid title="Foto's" subtitle="Stills, portretten en reportage." items={items} />;
}
