"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  PROBLEM_LABEL,
  INVOLVED_LABEL,
  ROUTE_LABEL,
  type ProblemArea,
  type ReferralRoute,
  type InvolvedParty,
  type Urgency,
} from "@/lib/referrals/types";

const STEPS = [
  { id: 1, label: "Wie meldt zich" },
  { id: 2, label: "Voor wie" },
  { id: 3, label: "Hulpvraag" },
  { id: 4, label: "Problematiek" },
  { id: 5, label: "Betrokken" },
  { id: 6, label: "Bijlagen" },
  { id: 7, label: "Privacy" },
  { id: 8, label: "Bevestigen" },
] as const;

type WizardState = {
  route: ReferralRoute;
  clientGivenName: string;
  clientFamilyName: string;
  clientBirthDate: string;
  clientCity: string;
  municipalityName: string;
  schoolName: string;
  schoolStatus: string;
  parents: Array<{
    givenName: string;
    familyName: string;
    relation: string;
    email: string;
    phone: string;
  }>;
  referrerType: string;
  referrerName: string;
  referrerOrganisation: string;
  referrerEmail: string;
  referrerPhone: string;
  referrerAgbCode: string;
  helpSummary: string;
  whatStuck: string;
  triedSoFar: string;
  urgency: Urgency;
  safetyConcerns: string;
  selfHarm: boolean;
  suicidality: boolean;
  unsafeAtHome: boolean;
  policeInvolvement: boolean;
  problemAreas: ProblemArea[];
  problemAreasOther: string;
  involvedParties: InvolvedParty[];
  files: File[];
  consentDataProcessing: boolean;
  consentContact: boolean;
  consentShareWithProfessionals: boolean;
  consentTruthful: boolean;
  signedBy: string;
};

const initial = (route: ReferralRoute): WizardState => ({
  route,
  clientGivenName: "",
  clientFamilyName: "",
  clientBirthDate: "",
  clientCity: "",
  // Bij de Lelystad-route geldt het BGGZ-contract met gemeente Lelystad —
  // dus woongemeente staat vast, woonplaats niet noodzakelijk.
  municipalityName: route === "lelystad" ? "Lelystad" : "",
  schoolName: "",
  schoolStatus: "",
  parents: [{ givenName: "", familyName: "", relation: "moeder", email: "", phone: "" }],
  referrerType: "huisarts",
  referrerName: "",
  referrerOrganisation: "",
  referrerEmail: "",
  referrerPhone: "",
  referrerAgbCode: "",
  helpSummary: "",
  whatStuck: "",
  triedSoFar: "",
  urgency: "regulier",
  safetyConcerns: "",
  selfHarm: false,
  suicidality: false,
  unsafeAtHome: false,
  policeInvolvement: false,
  problemAreas: [],
  problemAreasOther: "",
  involvedParties: [],
  files: [],
  consentDataProcessing: false,
  consentContact: false,
  consentShareWithProfessionals: false,
  consentTruthful: false,
  signedBy: "",
});

export function IntakeWizard({ initialRoute = "ouder" as ReferralRoute }: { initialRoute?: ReferralRoute }) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(() => initial(initialRoute));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    clientCode: string;
    trajectId?: string;
    route?: ReferralRoute;
  } | null>(null);

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const canNext = useMemo(() => stepValid(step, state), [step, state]);

  function next() {
    setError(null);
    if (!canNext) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  }
  function prev() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("route", state.route);
      fd.append("clientGivenName", state.clientGivenName);
      fd.append("clientFamilyName", state.clientFamilyName);
      if (state.clientBirthDate) fd.append("clientBirthDate", state.clientBirthDate);
      fd.append("clientCity", state.clientCity);
      fd.append("municipalityName", state.municipalityName);
      fd.append("schoolName", state.schoolName);
      fd.append("schoolStatus", state.schoolStatus);
      state.parents.forEach((p, i) => {
        fd.append(`parent${i}GivenName`, p.givenName);
        fd.append(`parent${i}FamilyName`, p.familyName);
        fd.append(`parent${i}Relation`, p.relation);
        fd.append(`parent${i}Email`, p.email);
        fd.append(`parent${i}Phone`, p.phone);
      });
      fd.append("referrerType", state.referrerType);
      fd.append("referrerName", state.referrerName);
      fd.append("referrerOrganisation", state.referrerOrganisation);
      fd.append("referrerEmail", state.referrerEmail);
      fd.append("referrerPhone", state.referrerPhone);
      fd.append("referrerAgbCode", state.referrerAgbCode);
      fd.append("helpSummary", state.helpSummary);
      fd.append("whatStuck", state.whatStuck);
      fd.append("triedSoFar", state.triedSoFar);
      fd.append("urgency", state.urgency);
      fd.append("safetyConcerns", state.safetyConcerns);
      fd.append("selfHarm", String(state.selfHarm));
      fd.append("suicidality", String(state.suicidality));
      fd.append("unsafeAtHome", String(state.unsafeAtHome));
      fd.append("policeInvolvement", String(state.policeInvolvement));
      state.problemAreas.forEach((p) => fd.append("problemAreas", p));
      fd.append("problemAreasOther", state.problemAreasOther);
      state.involvedParties.forEach((p) => fd.append("involvedParties", p));
      state.files.forEach((f) => fd.append("documents", f));
      fd.append("consentDataProcessing", String(state.consentDataProcessing));
      fd.append("consentContact", String(state.consentContact));
      fd.append("consentShareWithProfessionals", String(state.consentShareWithProfessionals));
      fd.append("consentTruthful", String(state.consentTruthful));
      fd.append("signedBy", state.signedBy);

      const res = await fetch("/api/referrals", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        clientCode?: string;
        trajectId?: string;
        route?: ReferralRoute;
        error?: string;
      };
      if (!res.ok || !data.id || !data.clientCode) {
        throw new Error(data.error ?? "Er ging iets mis bij het verzenden.");
      }
      setResult({
        id: data.id,
        clientCode: data.clientCode,
        trajectId: data.trajectId,
        route: data.route,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const isLelystad = result.route === "lelystad";
    return (
      <div className="card-soft text-center">
        <p className="eyebrow">Bedankt — uw aanmelding is binnen</p>
        <h2 className="display-3 mt-3 text-moss-950">
          Cliëntcode {result.clientCode}
        </h2>
        {isLelystad ? (
          <>
            <p className="mt-4 max-w-md mx-auto text-moss-800">
              Uw aanmelding voor het BGGZ-aanbod gemeente Lelystad is direct
              in onze zorg-engine geplaatst. Een gedragswetenschapper
              beoordeelt deze inhoudelijk en neemt binnen vijf werkdagen
              contact op met een passende vervolgstap — kortdurende
              interventie, gezamenlijk onderzoek of een doorverwijzing.
            </p>
            <p className="mt-2 text-xs text-moss-700">
              Bewaar de cliëntcode — handig bij telefonisch overleg.
            </p>
          </>
        ) : (
          <p className="mt-4 max-w-md mx-auto text-moss-800">
            Een coördinator beoordeelt uw aanmelding en neemt binnen vijf
            werkdagen contact op. Bewaar de cliëntcode — handig bij eventueel
            telefonisch overleg.
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Terug naar home</Link>
          <Link href="/behandelvisie" className="btn-ghost">Onze behandelvisie</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
        {STEPS.map((s) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step >= s.id && setStep(s.id)}
                disabled={step < s.id}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-forest-700 text-cream"
                    : done
                    ? "bg-moss-200 text-moss-900 hover:bg-moss-300"
                    : "border border-moss-300/70 text-moss-700"
                }`}
              >
                <span className="font-display">{s.id}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && <Step1 state={state} update={update} />}
          {step === 2 && <Step2 state={state} update={update} />}
          {step === 3 && <Step3 state={state} update={update} />}
          {step === 4 && <Step4 state={state} update={update} />}
          {step === 5 && <Step5 state={state} update={update} />}
          {step === 6 && <Step6 state={state} update={update} />}
          {step === 7 && <Step7 state={state} update={update} />}
          {step === 8 && <Step8 state={state} />}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-clay-200 bg-clay-50 px-4 py-3 text-sm text-clay-800">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={step === 1}
          className="btn-quiet disabled:opacity-40"
        >
          ← Vorige
        </button>
        {step < STEPS.length ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="btn-primary disabled:opacity-50"
          >
            Volgende stap →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-primary disabled:opacity-60"
          >
            {submitting ? "Verzenden…" : "Aanmelding verzenden"}
          </button>
        )}
      </div>
    </div>
  );
}

function stepValid(step: number, s: WizardState): boolean {
  switch (step) {
    case 1:
      return Boolean(s.route);
    case 2:
      return s.clientGivenName.trim().length > 0;
    case 3:
      return s.helpSummary.trim().length >= 10;
    case 4:
      return s.problemAreas.length > 0 || s.problemAreasOther.trim().length > 0;
    case 5:
      return true; // optional
    case 6:
      return true; // optional
    case 7:
      return (
        s.consentDataProcessing &&
        s.consentContact &&
        s.consentTruthful &&
        s.signedBy.trim().length > 0
      );
    case 8:
      return true;
    default:
      return false;
  }
}

/* ------------------------------- STAPPEN ------------------------------- */

function Step1({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const routes: ReferralRoute[] = ["lelystad", "ouder", "verwijzer", "gemeente", "casusoverleg"];
  return (
    <section>
      <Heading num="1" title="Wie meldt zich?" />
      <p className="mt-3 max-w-prose text-moss-800">
        Selecteer wat het beste past. We passen vervolgvragen daarop aan.
      </p>
      {state.route === "lelystad" && (
        <div className="mt-6 rounded-2xl border border-forest-700/30 bg-forest-700/5 p-5 text-sm text-moss-900">
          <p className="font-display text-base text-forest-800">
            U bent op de juiste plek voor jeugdigen uit gemeente Lelystad.
          </p>
          <p className="mt-2">
            Dit specifieke BGGZ-aanbod geldt voor kinderen die wonen in gemeente Lelystad. We
            onderzoeken samen of een kortdurende interventie passend is, of helpen met een
            doorverwijzing naar SGGZ. De woongemeente staat al ingevuld — controleer dat de
            woonplaats van het kind klopt in stap 2.
          </p>
        </div>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {routes.map((r) => (
          <label
            key={r}
            className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
              state.route === r
                ? "border-forest-700 bg-forest-700/5 ring-1 ring-forest-700"
                : "border-moss-300/70 hover:border-forest-600"
            }`}
          >
            <input
              type="radio"
              name="route"
              checked={state.route === r}
              onChange={() => {
                update("route", r);
                if (r === "lelystad") {
                  update("municipalityName", "Lelystad");
                }
              }}
              className="sr-only"
            />
            <p className="font-display text-lg text-moss-950">
              {ROUTE_LABEL[r]}
              {r === "lelystad" && (
                <span className="ml-2 rounded-full bg-forest-700 px-2 py-0.5 align-middle text-[11px] uppercase tracking-[0.14em] text-cream">
                  BGGZ
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-moss-700">{routeHint(r)}</p>
          </label>
        ))}
      </div>
    </section>
  );
}

function routeHint(r: ReferralRoute) {
  switch (r) {
    case "lelystad":
      return "Voor jeugdigen die wonen in gemeente Lelystad — BGGZ-aanbod voor enkelvoudige problematiek.";
    case "ouder":
      return "U bent ouder of verzorger en wilt uw kind aanmelden of overleggen.";
    case "verwijzer":
      return "U bent huisarts, jeugdarts, behandelaar of GI.";
    case "gemeente":
      return "U werkt bij een gemeente of ketenpartner.";
    case "casusoverleg":
      return "U wilt eerst een casus inhoudelijk overleggen.";
    default:
      return "";
  }
}

function Step2({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  return (
    <section>
      <Heading num="2" title="Voor wie is de aanmelding?" />
      <p className="mt-3 max-w-prose text-moss-800">
        Vul in wat u nodig acht. Hoe minder gevoelige data hier, hoe beter —
        details bespreken we liever in een gesprek.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Voornaam kind" required>
          <input
            type="text"
            value={state.clientGivenName}
            onChange={(e) => update("clientGivenName", e.target.value)}
            className={inputCls}
            autoComplete="off"
          />
        </Field>
        <Field label="Achternaam (optioneel)">
          <input
            type="text"
            value={state.clientFamilyName}
            onChange={(e) => update("clientFamilyName", e.target.value)}
            className={inputCls}
            autoComplete="off"
          />
        </Field>
        <Field label="Geboortedatum">
          <input
            type="date"
            value={state.clientBirthDate}
            onChange={(e) => update("clientBirthDate", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Woonplaats">
          <input
            type="text"
            value={state.clientCity}
            onChange={(e) => update("clientCity", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Gemeente">
          <input
            type="text"
            value={state.municipalityName}
            onChange={(e) => update("municipalityName", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="School of dagbesteding">
          <input
            type="text"
            value={state.schoolName}
            onChange={(e) => update("schoolName", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Schoolsituatie">
          <select
            value={state.schoolStatus}
            onChange={(e) => update("schoolStatus", e.target.value)}
            className={inputCls}
          >
            <option value="">— Selecteer —</option>
            <option value="ingeschreven">Ingeschreven</option>
            <option value="thuiszitter">Thuiszitter</option>
            <option value="geen-school">Geen school</option>
            <option value="anders">Anders</option>
          </select>
        </Field>
      </div>

      <h3 className="mt-10 font-display text-xl text-moss-950">Ouders / verzorgers</h3>
      <p className="mt-1 text-sm text-moss-700">U mag één of twee contactpersonen invullen.</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {state.parents.map((p, i) => (
          <div key={i} className="rounded-2xl border border-moss-200/70 bg-cream/60 p-5">
            <p className="eyebrow">Contactpersoon {i + 1}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Voornaam">
                <input
                  type="text"
                  value={p.givenName}
                  onChange={(e) => updateParent(state, update, i, "givenName", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Achternaam">
                <input
                  type="text"
                  value={p.familyName}
                  onChange={(e) => updateParent(state, update, i, "familyName", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Relatie">
                <select
                  value={p.relation}
                  onChange={(e) => updateParent(state, update, i, "relation", e.target.value)}
                  className={inputCls}
                >
                  <option value="moeder">Moeder</option>
                  <option value="vader">Vader</option>
                  <option value="verzorger">Verzorger</option>
                  <option value="voogd">Voogd</option>
                  <option value="anders">Anders</option>
                </select>
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  value={p.email}
                  onChange={(e) => updateParent(state, update, i, "email", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Telefoon">
                <input
                  type="tel"
                  value={p.phone}
                  onChange={(e) => updateParent(state, update, i, "phone", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      {state.parents.length < 2 && (
        <button
          type="button"
          onClick={() =>
            update("parents", [
              ...state.parents,
              { givenName: "", familyName: "", relation: "vader", email: "", phone: "" },
            ])
          }
          className="mt-4 btn-quiet"
        >
          + Tweede contactpersoon toevoegen
        </button>
      )}

      {state.route === "verwijzer" || state.route === "gemeente" || state.route === "casusoverleg" ? (
        <>
          <h3 className="mt-10 font-display text-xl text-moss-950">Uw gegevens</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Rol">
              <select
                value={state.referrerType}
                onChange={(e) => update("referrerType", e.target.value)}
                className={inputCls}
              >
                <option value="huisarts">Huisarts</option>
                <option value="jeugdarts">Jeugdarts</option>
                <option value="gi-jeugdbeschermer">GI / jeugdbeschermer</option>
                <option value="cjg-wijkteam">CJG / wijkteam</option>
                <option value="jeugdconsulent">Jeugdconsulent</option>
                <option value="school">School</option>
                <option value="andere-behandelaar">Andere behandelaar</option>
                <option value="anders">Anders</option>
              </select>
            </Field>
            <Field label="Naam" required>
              <input
                type="text"
                value={state.referrerName}
                onChange={(e) => update("referrerName", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Organisatie">
              <input
                type="text"
                value={state.referrerOrganisation}
                onChange={(e) => update("referrerOrganisation", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="AGB-code (indien van toepassing)">
              <input
                type="text"
                value={state.referrerAgbCode}
                onChange={(e) => update("referrerAgbCode", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={state.referrerEmail}
                onChange={(e) => update("referrerEmail", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Telefoon">
              <input
                type="tel"
                value={state.referrerPhone}
                onChange={(e) => update("referrerPhone", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </>
      ) : null}
    </section>
  );
}

function updateParent(
  state: WizardState,
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void,
  index: number,
  field: keyof WizardState["parents"][number],
  value: string,
) {
  const next = state.parents.map((p, i) => (i === index ? { ...p, [field]: value } : p));
  update("parents", next);
}

function Step3({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const urgencies: { value: Urgency; label: string; help: string }[] = [
    { value: "laag", label: "Laag", help: "Geen tijdsdruk." },
    { value: "regulier", label: "Regulier", help: "Binnen redelijke termijn graag contact." },
    { value: "verhoogd", label: "Verhoogd", help: "Het loopt op meerdere fronten vast." },
    { value: "crisis-overleg-gewenst", label: "Crisis-overleg gewenst", help: "Acute zorgen. Bel ons na verzending direct." },
  ];
  return (
    <section>
      <Heading num="3" title="Wat is de hulpvraag?" />
      <p className="mt-3 max-w-prose text-moss-800">
        Houd het kort en feitelijk. Volledige diagnoses of dossiers horen
        hier niet thuis — die bespreken we in de intake.
      </p>
      <div className="mt-6 space-y-5">
        <Field label="Korte omschrijving (verplicht)" required>
          <textarea
            value={state.helpSummary}
            onChange={(e) => update("helpSummary", e.target.value)}
            rows={4}
            maxLength={2000}
            className={inputCls + " min-h-[120px]"}
            placeholder="Bijvoorbeeld: 'Onze zoon (12) zit drie maanden thuis, raakt overprikkeld op school, traumatische ervaringen in 2024…'"
          />
        </Field>
        <Field label="Wat loopt vast?">
          <textarea
            value={state.whatStuck}
            onChange={(e) => update("whatStuck", e.target.value)}
            rows={3}
            maxLength={2000}
            className={inputCls + " min-h-[96px]"}
          />
        </Field>
        <Field label="Wat is al geprobeerd?">
          <textarea
            value={state.triedSoFar}
            onChange={(e) => update("triedSoFar", e.target.value)}
            rows={3}
            maxLength={2000}
            className={inputCls + " min-h-[96px]"}
          />
        </Field>
        <div>
          <p className="text-sm font-medium text-moss-900">Urgentie</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {urgencies.map((u) => (
              <label
                key={u.value}
                className={`cursor-pointer rounded-2xl border p-4 ${
                  state.urgency === u.value
                    ? "border-forest-700 bg-forest-700/5"
                    : "border-moss-300/70 hover:border-forest-600"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={state.urgency === u.value}
                  onChange={() => update("urgency", u.value)}
                />
                <p className="font-display text-base text-moss-950">{u.label}</p>
                <p className="text-sm text-moss-700">{u.help}</p>
              </label>
            ))}
          </div>
        </div>
        <Field label="Veiligheidszorgen (kort en feitelijk)">
          <textarea
            value={state.safetyConcerns}
            onChange={(e) => update("safetyConcerns", e.target.value)}
            rows={3}
            maxLength={1000}
            className={inputCls + " min-h-[96px]"}
            placeholder="Aanwezig / overleg gewenst — geen klinische details."
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Checkbox
            checked={state.selfHarm}
            onChange={(v) => update("selfHarm", v)}
            label="Zelfbeschadiging aanwezig"
          />
          <Checkbox
            checked={state.suicidality}
            onChange={(v) => update("suicidality", v)}
            label="Suïcidaliteit aanwezig"
          />
          <Checkbox
            checked={state.unsafeAtHome}
            onChange={(v) => update("unsafeAtHome", v)}
            label="Onveiligheid thuis"
          />
          <Checkbox
            checked={state.policeInvolvement}
            onChange={(v) => update("policeInvolvement", v)}
            label="Politie betrokken geweest"
          />
        </div>
      </div>
    </section>
  );
}

function Step4({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const all = Object.keys(PROBLEM_LABEL) as ProblemArea[];
  function toggle(p: ProblemArea) {
    update(
      "problemAreas",
      state.problemAreas.includes(p)
        ? state.problemAreas.filter((x) => x !== p)
        : [...state.problemAreas, p],
    );
  }
  return (
    <section>
      <Heading num="4" title="Welke problematiek speelt er?" />
      <p className="mt-3 max-w-prose text-moss-800">
        Eén of meer aanvinken — of overslaan en in stap 3 toelichten.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((p) => (
          <label
            key={p}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
              state.problemAreas.includes(p)
                ? "border-forest-700 bg-forest-700/5"
                : "border-moss-300/70 hover:border-forest-600"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 accent-forest-700"
              checked={state.problemAreas.includes(p)}
              onChange={() => toggle(p)}
            />
            <span>{PROBLEM_LABEL[p]}</span>
          </label>
        ))}
      </div>
      <div className="mt-6">
        <Field label="Anders, namelijk">
          <input
            type="text"
            value={state.problemAreasOther}
            onChange={(e) => update("problemAreasOther", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
    </section>
  );
}

function Step5({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const parties = Object.keys(INVOLVED_LABEL) as InvolvedParty[];
  function toggle(p: InvolvedParty) {
    update(
      "involvedParties",
      state.involvedParties.includes(p)
        ? state.involvedParties.filter((x) => x !== p)
        : [...state.involvedParties, p],
    );
  }
  return (
    <section>
      <Heading num="5" title="Welke partijen zijn betrokken?" />
      <p className="mt-3 max-w-prose text-moss-800">
        Helpt ons om snel de juiste lijnen te leggen.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {parties.map((p) => (
          <label
            key={p}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
              state.involvedParties.includes(p)
                ? "border-forest-700 bg-forest-700/5"
                : "border-moss-300/70 hover:border-forest-600"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 accent-forest-700"
              checked={state.involvedParties.includes(p)}
              onChange={() => toggle(p)}
            />
            <span>{INVOLVED_LABEL[p]}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function Step6({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  const max = 8;
  const maxBytes = 8 * 1024 * 1024;
  function onFiles(list: FileList | null) {
    if (!list) return;
    const accepted: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > maxBytes) continue;
      if (![
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ].includes(f.type)) continue;
      accepted.push(f);
    }
    update("files", [...state.files, ...accepted].slice(0, max));
  }
  return (
    <section>
      <Heading num="6" title="Bijlagen uploaden (optioneel)" />
      <p className="mt-3 max-w-prose text-moss-800">
        Verwijsbrief, beschikking, verslagen, diagnostiek, schoolinformatie of
        veiligheidsplan. PDF, DOCX, JPG of PNG. Max 8 MB per bestand, max 8
        bestanden.
      </p>
      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-moss-300 bg-cream/50 px-6 py-12 text-center hover:border-forest-600">
        <span className="font-display text-lg text-moss-950">
          Klik om bestanden te kiezen
        </span>
        <span className="mt-1 text-sm text-moss-700">
          of sleep ze hier naartoe
        </span>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </label>
      {state.files.length > 0 && (
        <ul className="mt-6 space-y-2">
          {state.files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-2xl border border-moss-200/70 bg-cream px-4 py-3 text-sm"
            >
              <span>
                {f.name}{" "}
                <span className="text-moss-600">
                  ({Math.round(f.size / 1024)} KB)
                </span>
              </span>
              <button
                type="button"
                className="text-clay-700 hover:underline"
                onClick={() =>
                  update(
                    "files",
                    state.files.filter((_, j) => j !== i),
                  )
                }
              >
                Verwijderen
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-moss-700">
        Bestanden worden veilig en versleuteld verzonden, opgeslagen buiten de
        publieke website en alleen toegankelijk voor de behandelende
        coördinator.
      </p>
    </section>
  );
}

function Step7({
  state,
  update,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
}) {
  return (
    <section>
      <Heading num="7" title="Toestemming en privacy" />
      <p className="mt-3 max-w-prose text-moss-800">
        AgoNatura behandelt deze aanmelding als gevoelige zorginformatie. Lees
        kort onze{" "}
        <Link href="/privacyverklaring" className="underline underline-offset-4 hover:text-forest-700">
          privacyverklaring
        </Link>{" "}
        en geef hieronder toestemming.
      </p>

      <div className="mt-6 space-y-3">
        <Checkbox
          checked={state.consentDataProcessing}
          onChange={(v) => update("consentDataProcessing", v)}
          label="Ik geef toestemming voor de verwerking van de hierboven ingevulde persoonsgegevens, conform de AVG."
          required
        />
        <Checkbox
          checked={state.consentContact}
          onChange={(v) => update("consentContact", v)}
          label="Ik geef toestemming aan AgoNatura om contact met mij op te nemen over deze aanmelding."
          required
        />
        <Checkbox
          checked={state.consentShareWithProfessionals}
          onChange={(v) => update("consentShareWithProfessionals", v)}
          label="Indien een traject start, mogen relevante gegevens binnen het AgoNatura-behandelteam gedeeld worden."
        />
        <Checkbox
          checked={state.consentTruthful}
          onChange={(v) => update("consentTruthful", v)}
          label="De hierboven ingevulde informatie is naar waarheid ingevuld."
          required
        />
      </div>

      <div className="mt-6 max-w-md">
        <Field label="Digitale handtekening (volledige naam)" required>
          <input
            type="text"
            value={state.signedBy}
            onChange={(e) => update("signedBy", e.target.value)}
            className={inputCls}
            autoComplete="name"
          />
        </Field>
      </div>
    </section>
  );
}

function Step8({ state }: { state: WizardState }) {
  const items: Array<[string, string]> = [
    ["Route", ROUTE_LABEL[state.route]],
    ["Kind", `${state.clientGivenName} ${state.clientFamilyName}`.trim()],
    ["Geboortedatum", state.clientBirthDate || "—"],
    ["Woonplaats", state.clientCity || "—"],
    ["Gemeente", state.municipalityName || "—"],
    ["School", state.schoolName || "—"],
    ["Urgentie", state.urgency],
    ["Hulpvraag", state.helpSummary],
    [
      "Problematiek",
      state.problemAreas.map((p) => PROBLEM_LABEL[p]).join(", ") || state.problemAreasOther || "—",
    ],
    [
      "Betrokken",
      state.involvedParties.map((p) => INVOLVED_LABEL[p]).join(", ") || "—",
    ],
    ["Bijlagen", state.files.length ? `${state.files.length} bestand(en)` : "geen"],
    ["Ondertekend door", state.signedBy],
  ];
  return (
    <section>
      <Heading num="8" title="Controleren en verzenden" />
      <p className="mt-3 max-w-prose text-moss-800">
        Controleer kort de samenvatting. Komt iets niet kloppen? Ga terug naar
        de betreffende stap. Onderaan verzendt u de aanmelding.
      </p>
      <dl className="mt-6 divide-y divide-moss-200/70 rounded-2xl border border-moss-200/70 bg-cream">
        {items.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[180px_1fr]">
            <dt className="text-xs uppercase tracking-[0.18em] text-moss-700">{label}</dt>
            <dd className="text-sm text-moss-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* --------------------------- UI primitives --------------------------- */

const inputCls =
  "w-full rounded-2xl border border-moss-300/70 bg-cream/80 px-4 py-3 text-base text-moss-900 outline-none ring-forest-600 focus:ring-2 disabled:opacity-60";

function Heading({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-700 font-display text-cream">
        {num}
      </span>
      <h2 className="display-3 text-moss-950">{title}</h2>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-moss-900">
        {label} {required && <span className="text-clay-600" aria-hidden="true">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-moss-200/70 bg-cream/60 p-4">
      <input
        type="checkbox"
        className="mt-1 accent-forest-700"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-moss-900">
        {label} {required && <span className="text-clay-600" aria-hidden="true">*</span>}
      </span>
    </label>
  );
}
