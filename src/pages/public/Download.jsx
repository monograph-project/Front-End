import { BlogShell } from "../blog/BlogShell";

export default function Download() {
  return (
    <BlogShell variant="feed">
      <div className="py-14 sm:py-20 lg:pb-28">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Download
        </p>
        <h1 className="font-blog-display max-w-2xl text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
          Reader &amp; offline access
        </h1>
        <p className="mt-6 max-w-2xl font-blog-serif text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
          Desktop and mobile apps are not shipped in this demo. When your product
          team adds installers or PWA export, replace this copy and add download
          buttons here.
        </p>
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white/80 p-10 text-center text-sm text-neutral-500 dark:border-white/15 dark:bg-white/5 dark:text-neutral-400">
          Placeholder — link your release pipeline or artifact store.
        </div>
      </div>
    </BlogShell>
  );
}
