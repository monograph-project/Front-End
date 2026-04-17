import { Link } from "react-router-dom";

const SAVED = [
  { id: "2", title: "Why Group Projects Need Clear Roles" },
  { id: "3", title: "From Topic to Thread: Writing Like Medium" },
];

export default function ReaderLibrary() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Reading list</h1>
      <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
        Saved stories (local demo). Sync with your account when the API is ready.
      </p>
      <ul className="mt-8 space-y-3">
        {SAVED.map((item) => (
          <li key={item.id}>
            <Link
              to={`/story/${item.id}`}
              className="block rounded-xl border border-default bg-card px-4 py-3 font-medium transition hover:bg-nav-hover dark:border-dark-default dark:bg-dark-card dark:hover:bg-dark-nav-hover"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
