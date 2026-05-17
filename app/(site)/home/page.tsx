import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import { getByCategory, getFeatured, getPublished, getRecent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, recent, films, animaties, fotos, projecten, all] = await Promise.all([
    getFeatured(),
    getRecent(12),
    getByCategory("films"),
    getByCategory("animaties"),
    getByCategory("fotos"),
    getByCategory("projecten"),
    getPublished(),
  ]);

  const hero = featured[0] ?? all[0];

  return (
    <main>
      {hero && <Hero item={hero} />}
      <div className="-mt-16 relative z-10">
        <Carousel title="Nieuw toegevoegd" items={recent} />
        {featured.length > 1 && <Carousel title="Uitgelicht" items={featured} size="lg" />}
        <Carousel title="Films" items={films} />
        <Carousel title="Animaties" items={animaties} />
        <Carousel title="Foto's" items={fotos} />
        <Carousel title="Projecten" items={projecten} />
      </div>
    </main>
  );
}
