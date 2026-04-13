import { useState } from "react";
import { Link } from "react-router-dom";

export default function WriteStory() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="mx-auto w-full  px-4 py-10 sm:px-6">
      <p className="mb-6 text-sm text-muted-foreground font-body">
        <Link
          to="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          ← Back to feed
        </Link>
      </p>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Write a story
      </h1>
      <p className="mt-2 text-secondary dark:text-dark-secondary font-body text-sm">
        Public stories are visible to everyone. Faculty coursework stays in your
        role dashboard.
      </p>

      {saved && (
        <p
          className="mt-4 rounded-xl border border-default bg-card px-4 py-3 text-sm text-secondary dark:border-dark-default dark:bg-dark-card dark:text-dark-secondary"
          role="status"
        >
          {title.trim()
            ? "Draft recorded in this session — connect your API to persist and publish."
            : "Add a title when you are ready; body can be refined in the next step."}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A clear, compelling headline"
            className="mt-2 w-full border-0 border-b border-border bg-transparent py-2 font-heading text-2xl font-semibold outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Story
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            placeholder="Share an idea, tutorial, or experience…"
            className="mt-2 w-full resize-y rounded-xl border border-default bg-input p-4 font-serif text-base leading-relaxed outline-none focus:border-primary dark:border-dark-default dark:bg-dark-input dark:text-dark-primary"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Save draft
          </button>
          <button
            type="button"
            className="rounded-full border border-default px-6 py-2.5 text-sm font-medium text-secondary transition hover:bg-muted dark:border-dark-default dark:text-dark-secondary dark:hover:bg-dark-nav-hover"
          >
            Preview
          </button>
        </div>
      </form>
    </div>
  );
}
