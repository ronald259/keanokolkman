type Props = { className?: string };

export function Logo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 3c2.6 5 6.4 8.2 11 9.6-2.8 3-4.6 6.7-5.4 11C24 18.6 21.8 14.8 20 11c-1.8 3.8-4 7.6-5.6 12.6C13.6 19.3 11.8 15.6 9 12.6 13.6 11.2 17.4 8 20 3Z"
        fill="currentColor"
      />
      <path
        d="M11 31c2.4-1.3 4.4-3.4 6-6 1.8 3.6 4.4 6.2 7.6 7.8-2.3 1-4.6 1.7-6.9 2-1.4-1.2-3.2-2.5-6.7-3.8Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path d="M19 24v13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
