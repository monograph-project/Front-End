import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { getStoryById } from "../../data/mockStories";
import AvatarDemo from "../../components/Avatar";
import { useAuth } from "../../context/AuthContext";
import { BlogShell } from "./BlogShell";

function StoryResponses({ storyTitle }) {
  const location = useLocation();
  const { isAuthenticated, hydrated } = useAuth();
  const [draft, setDraft] = useState("");

  return (
    <section
      className="mt-16 border-t border-default pt-12 dark:border-dark-default"
      aria-labelledby="story-responses-heading"
    >
      <h2
        id="story-responses-heading"
        className="font-blog-display text-xl font-bold text-primary dark:text-dark-primary"
      >
        Responses
      </h2>
      <p className="mt-2 text-sm text-muted dark:text-dark-muted">
        Discussion on “{storyTitle}”
      </p>

      {!hydrated ? (
        <div className="mt-8 h-24 animate-pulse rounded-xl bg-shell dark:bg-dark-card" />
      ) : !isAuthenticated ? (
        <div className="mt-8 rounded-2xl border border-default bg-card px-6 py-8 text-center dark:border-dark-default dark:bg-dark-card">
          <p className="font-blog-serif text-secondary dark:text-dark-secondary">
            Sign in to read the full thread and post a response.
          </p>
          <Link
            to="/login"
            state={{ from: location }}
            className="btn-primary mt-6 inline-flex h-10 items-center px-6 text-sm"
          >
            Log in to comment
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <label htmlFor="story-response" className="sr-only">
            Write a response
          </label>
          <textarea
            id="story-response"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share your perspective…"
            rows={4}
            className="w-full resize-y rounded-2xl border border-default bg-shell px-4 py-3 font-blog-serif text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary dark:placeholder:text-dark-muted"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="btn-primary inline-flex h-10 items-center px-5 text-sm disabled:opacity-40"
              disabled={!draft.trim()}
              onClick={() => {
                window.GooeyToaster?.info?.(
                  "Wire responses to your blog comments API.",
                );
                setDraft("");
              }}
            >
              Publish response
            </button>
            <span className="text-xs text-muted dark:text-dark-muted">
              Responses will appear here after your backend is connected.
            </span>
          </div>
          <ul className="mt-10 space-y-8 border-t border-default pt-10 dark:border-dark-default">
            <li className="font-blog-serif text-sm text-muted italic dark:text-dark-muted">
              No published responses yet — be the first.
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}

export default function StoryDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const story = getStoryById(id);
  const [localClaps, setLocalClaps] = useState(story?.claps_count || 0);
  const [clapped, setClapped] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);

  const handleClap = useCallback(() => {
    setLocalClaps((c) => c + 1);
    setClapped(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercent = height > 0 ? (scrolled / height) * 100 : 0;
      setProgress(Math.min(scrolledPercent, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!story) {
    return (
      <BlogShell variant="article">
        <div className="px-4 py-24 text-center">
          <h1 className="font-blog-display text-2xl font-bold text-primary dark:text-dark-primary">
            Story not found
          </h1>
          <p className="mt-3 text-secondary dark:text-dark-secondary">
            That story may have been removed or the link is incorrect.
          </p>
          <Link
            to="/"
            className="btn-primary mt-8 inline-flex h-10 items-center px-6 text-sm"
          >
            Back to home
          </Link>
        </div>
      </BlogShell>
    );
  }

  const date = story.created_date
    ? format(new Date(story.created_date), "MMM d, yyyy")
    : "";
  const readTime = story.reading_time || 6;
  const authorName = story.author_name || "Anonymous";

  return (
    <>
      <div
        className="fixed inset-x-0 top-14 z-[19] h-0.5 sm:top-16"
        aria-hidden
      >
        <div
          className="bg-primary transition-[width] duration-150 dark:bg-dark-primary"
          style={{ width: `${progress}%`, height: "100%" }}
        />
      </div>

      <BlogShell variant="article">
        <article ref={contentRef} className="pb-24 pt-10 sm:pt-14 lg:pb-28">
          <header className="border-b border-default pb-10 dark:border-dark-default">
            <h1 className="font-blog-display text-[2rem] font-bold leading-[1.18] tracking-tight text-primary sm:text-[2.75rem] sm:leading-[1.12] md:text-[2.875rem] dark:text-dark-primary">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="font-blog-serif mt-4 text-xl leading-snug text-secondary sm:text-[1.35rem] dark:text-dark-secondary">
                {story.subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={isAuthenticated ? "/writer/profile" : "/login"}
                  state={isAuthenticated ? undefined : { from: location }}
                  className="flex items-center gap-3 rounded-full hover:opacity-90"
                >
                  <AvatarDemo />
                  <span className="font-medium text-primary underline-offset-4 hover:underline dark:text-dark-primary">
                    {authorName}
                  </span>
                </Link>
                <button
                  type="button"
                  className="rounded-full border border-success/55 bg-transparent px-4 py-1.5 text-sm font-semibold text-success hover:bg-success/10 dark:border-success dark:text-success dark:hover:bg-success/15"
                >
                  Follow
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted dark:text-dark-muted">
                <span>{readTime} min read</span>
                <span aria-hidden>&middot;</span>
                <time dateTime={story.created_date}>{date}</time>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-default py-6 dark:border-dark-default">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClap}
                  aria-label={`Clap, ${localClaps} claps`}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-nav-hover dark:hover:bg-dark-hover ${
                    clapped ? "text-primary dark:text-dark-primary" : ""
                  }`}
                >
                  <span className={`text-xl ${clapped ? "grayscale-0" : ""}`}>
                    👏
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {localClaps}
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-nav-hover dark:hover:bg-dark-hover"
                  aria-label="Responses"
                >
                  <MessageCircle className="size-5 stroke-[1.5] text-muted dark:text-dark-muted" />
                  <span className="text-sm font-medium tabular-nums text-muted dark:text-dark-muted">
                    12
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-full p-2.5 hover:bg-nav-hover dark:hover:bg-dark-hover"
                  aria-label="Share"
                >
                  <Share2 className="size-[18px] stroke-[1.5] text-secondary dark:text-dark-secondary" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2.5 hover:bg-nav-hover dark:hover:bg-dark-hover"
                  aria-label="Save to reading list"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login", { state: { from: location } });
                      return;
                    }
                    window.GooeyToaster?.info?.("Wire reading list to your API.");
                  }}
                >
                  <Bookmark className="size-[18px] stroke-[1.5] text-secondary dark:text-dark-secondary" />
                </button>
              </div>
            </div>
          </header>

          {story.cover_image && (
            <figure className="mt-10 overflow-hidden rounded-sm">
              <img
                src={story.cover_image}
                alt=""
                className="w-full object-cover"
                loading="lazy"
              />
            </figure>
          )}

          <section className="mt-10 sm:mt-12">
            {story.content ? (
              <div
                className="blog-article-prose [&>*:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />
            ) : (
              <p className="font-blog-serif py-20 text-center text-lg italic text-muted dark:text-dark-muted">
                Full story body will load from your API…
              </p>
            )}
          </section>

          {story.tags?.length > 0 && (
            <footer className="mt-16 border-t border-default pt-10 dark:border-dark-default">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
                Tagged in
              </p>
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/topic/${encodeURIComponent(tag)}`}
                    className="rounded-full border border-default bg-shell px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary dark:border-dark-default dark:bg-dark-shell dark:text-dark-secondary dark:hover:border-dark-primary dark:hover:text-dark-primary"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <Link
                to="/"
                className="btn-secondary mt-10 inline-flex h-10 items-center px-6 text-sm"
              >
                More stories for you
              </Link>
            </footer>
          )}

          <StoryResponses storyTitle={story.title} />
        </article>
      </BlogShell>
    </>
  );
}
