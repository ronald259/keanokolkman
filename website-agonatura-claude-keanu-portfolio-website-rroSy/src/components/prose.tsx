import { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="prose-agonatura max-w-prose text-moss-900">
      <style>{`
        .prose-agonatura p { margin-top: 1.25rem; line-height: 1.75; }
        .prose-agonatura h2 { font-family: var(--font-fraunces), Georgia, serif; font-size: 1.9rem; margin-top: 3rem; color: #1e3327; letter-spacing: -0.01em; }
        .prose-agonatura h3 { font-family: var(--font-fraunces), Georgia, serif; font-size: 1.35rem; margin-top: 2rem; color: #243d2f; }
        .prose-agonatura ul { margin-top: 1rem; padding-left: 1.25rem; list-style: disc; }
        .prose-agonatura ul li { margin-top: 0.35rem; }
        .prose-agonatura blockquote {
          margin-top: 2rem; padding-left: 1.25rem; border-left: 2px solid #6a8458;
          font-family: var(--font-fraunces), Georgia, serif; font-size: 1.4rem; line-height: 1.4; color: #243d2f;
        }
      `}</style>
      {children}
    </div>
  );
}
