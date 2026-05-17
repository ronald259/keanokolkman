import CategoryGrid from "@/components/CategoryGrid";
import { getByCategory } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function FilmsPage() {
  const items = await getByCategory("films");
  return <CategoryGrid title="Films" subtitle="Korte films, documentaires en cinematic projecten." items={items} />;
}
