import { BlogShell } from "../blog/BlogShell";

export default function Documentation() {
  return (
    <BlogShell variant="feed">
      <div className="py-14 sm:py-20 lg:pb-28">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Documentation
        </p>
        <h1 className="font-blog-display max-w-2xl text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
          Writing, publishing &amp; commenting
        </h1>
        <ul className="mt-8 max-w-2xl list-inside list-disc space-y-3 font-blog-serif text-neutral-600 dark:text-neutral-300">
          <li>
            <strong className="text-neutral-900 dark:text-white">Read</strong>{" "}
            — all stories and topic feeds are public.
          </li>
          <li>
            <strong className="text-neutral-900 dark:text-white">Publish</strong>{" "}
            — sign in to open the editor and save drafts.
          </li>
          <li>
            <strong className="text-neutral-900 dark:text-white">Comments</strong>{" "}
            — sign in to respond on article pages.
          </li>
          <li>
            <strong className="text-neutral-900 dark:text-white">Reading list</strong>{" "}
            — requires an account.
          </li>
        </ul>
        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          Point this page to your real docs / OpenAPI / CMS admin when ready.
        </p>
      </div>
    </BlogShell>
  );
}
