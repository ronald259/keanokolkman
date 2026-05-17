"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadAction } from "../actions";

type Step = 1 | 2 | 3 | 4 | 5;

export default function UploadWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [media, setMedia] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("films");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const isVideo = media?.type.startsWith("video/") ?? false;
  const mediaPreview = media ? URL.createObjectURL(media) : null;
  const thumbPreview = thumb ? URL.createObjectURL(thumb) : null;

  function submit() {
    if (!media) return;
    setError("");
    const fd = new FormData();
    fd.set("media", media);
    if (thumb) fd.set("thumbnail", thumb);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("category", category);
    fd.set("tags", tags);
    fd.set("featured", featured ? "on" : "");
    fd.set("status", "published");
    startTransition(async () => {
      const res = await uploadAction(fd);
      if (res.ok) {
        router.push(`/media/${res.id}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 md:p-8">
      <Stepper step={step} />

      {step === 1 && (
        <Section title="1. Kies een bestand" description="MP4, MOV, WebM (video) of JPG, PNG, WebP (foto). Max 200 MB.">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp"
            onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:bg-[var(--color-accent)] file:text-black file:font-semibold hover:file:bg-[var(--color-accent-2)] cursor-pointer"
          />
          {media && (
            <div className="mt-4 text-sm text-[var(--color-muted)]">
              <div>
                <span className="text-white">{media.name}</span> · {(media.size / 1024 / 1024).toFixed(1)} MB · {media.type}
              </div>
              {media.size > 200 * 1024 * 1024 && (
                <div className="text-red-300 mt-2">Bestand is groter dan 200 MB.</div>
              )}
            </div>
          )}
          <Nav onNext={() => setStep(2)} nextDisabled={!media || media.size > 200 * 1024 * 1024} />
        </Section>
      )}

      {step === 2 && (
        <Section title="2. Titel en beschrijving" description="Wat zien bezoekers?">
          <label className="block mb-4">
            <span className="text-sm text-[var(--color-muted)]">Titel</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)]"
              maxLength={120}
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">Beschrijving</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)] resize-y"
              maxLength={2000}
            />
          </label>
          <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!title.trim()} />
        </Section>
      )}

      {step === 3 && (
        <Section title="3. Thumbnail" description={isVideo ? "Verplicht voor video's. Kies een aantrekkelijke still." : "Optioneel — de foto wordt anders zelf als thumbnail gebruikt."}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setThumb(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:font-semibold hover:file:bg-white/20 cursor-pointer"
          />
          {thumbPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbPreview} alt="" className="mt-4 rounded-lg max-h-48 border border-white/10" />
          )}
          {!thumb && !isVideo && mediaPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPreview} alt="" className="mt-4 rounded-lg max-h-48 border border-white/10 opacity-80" />
          )}
          <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={isVideo && !thumb} />
        </Section>
      )}

      {step === 4 && (
        <Section title="4. Categorie en details" description="Waar hoort dit thuis?">
          <label className="block mb-4">
            <span className="text-sm text-[var(--color-muted)]">Categorie</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="films">Films</option>
              <option value="animaties">Animaties</option>
              <option value="fotos">Foto&apos;s</option>
              <option value="projecten">Projecten</option>
            </select>
          </label>
          <label className="block mb-4">
            <span className="text-sm text-[var(--color-muted)]">Tags (komma-gescheiden, optioneel)</span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bijv. noir, kort, cinematic"
              className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--color-accent)]"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Markeer als uitgelicht (verschijnt in hero / uitgelicht-rij)
          </label>
          <Nav onBack={() => setStep(3)} onNext={() => setStep(5)} />
        </Section>
      )}

      {step === 5 && (
        <Section title="5. Controleren & publiceren" description="Controleer en publiceer.">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-black/40 rounded-lg p-3 border border-white/10">
              {thumbPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={thumbPreview} alt="" className="rounded mb-3" />
              ) : mediaPreview && !isVideo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={mediaPreview} alt="" className="rounded mb-3" />
              ) : null}
              <div className="text-[var(--color-muted)] text-xs uppercase tracking-wider">Voorvertoning</div>
              <div className="font-semibold">{title || "(geen titel)"}</div>
            </div>
            <dl className="space-y-2">
              <Row label="Bestand" value={media?.name || "—"} />
              <Row label="Type" value={isVideo ? "Video" : "Foto"} />
              <Row label="Grootte" value={media ? `${(media.size / 1024 / 1024).toFixed(1)} MB` : "—"} />
              <Row label="Categorie" value={category} />
              <Row label="Tags" value={tags || "—"} />
              <Row label="Uitgelicht" value={featured ? "Ja" : "Nee"} />
            </dl>
          </div>

          {error && <div className="mt-4 text-sm text-red-300 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">{error}</div>}

          <div className="mt-6 flex gap-3 justify-between">
            <button className="btn btn-ghost" onClick={() => setStep(4)} disabled={pending}>← Terug</button>
            <button className="btn btn-primary" onClick={submit} disabled={pending}>
              {pending ? "Bezig met uploaden…" : "Publiceren"}
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Bestand", "Titel", "Thumbnail", "Categorie", "Publiceren"];
  return (
    <ol className="flex items-center justify-between mb-8 text-xs">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <li key={l} className="flex-1 flex items-center gap-2 last:flex-none">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                done ? "bg-[var(--color-accent)] text-black border-transparent" : active ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-white/15 text-[var(--color-muted)]"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={active ? "text-white" : "text-[var(--color-muted)]"}>{l}</span>
            {n < 5 && <span className="hidden sm:block flex-1 h-px bg-white/10 mx-2" />}
          </li>
        );
      })}
    </ol>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="fade-up">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-[var(--color-muted)] mb-5">{description}</p>}
      {children}
    </div>
  );
}

function Nav({ onBack, onNext, nextDisabled }: { onBack?: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return (
    <div className="mt-6 flex justify-between gap-3">
      {onBack ? <button className="btn btn-ghost" onClick={onBack}>← Terug</button> : <span />}
      <button className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>Volgende →</button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/5 pb-1.5">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="text-right truncate max-w-[60%]">{value}</dd>
    </div>
  );
}
