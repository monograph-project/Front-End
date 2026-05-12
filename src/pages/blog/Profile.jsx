import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AvatarDemo from "../../components/Avatar.jsx";
import Button from "../../components/Button.jsx";
import ContributionHeatmap from "../../components/repo/ContributionHeatmap.jsx";
import { BlogShell } from "./BlogShell";

const TABS = ["Stories", "About"];

const makeStory = (i, owner = false) => ({
  id: i,
  title: `Sample story title ${i}`,
  subtitle: `A short subtitle for story ${i} that teases the idea and tone.`,
  cover: `https://picsum.photos/seed/story${i}/900/400`,
  readTime: 3 + (i % 7),
  clapCount: Math.floor(Math.random() * 500),
  views: Math.floor(Math.random() * 5000),
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  popular: i % 5 === 0,
  draft: owner && i % 11 === 0,
  scheduled: owner && i % 17 === 0,
  private: owner && i % 19 === 0,
});

function useAllStories(totalCount, generate) {
  const [items] = useState(() =>
    Array.from({ length: totalCount }, (_, i) => generate(i + 1)),
  );
  const [list, setList] = useState(items);

  return { items: list, setItems: setList };
}

function buildStoryHeatmap(stories) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 83);
  const counts = new Map();

  stories.forEach((story) => {
    const date = new Date(story.date);
    if (Number.isNaN(date.getTime())) return;
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < 84; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    currentWeek.push({ key, value: counts.get(key) ?? 0 });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return {
    weeks,
    max: Math.max(1, ...weeks.flat().map((cell) => cell.value)),
  };
}

export default function Profile() {
  const [isOwner] = useState(true);
  const [activeTab, setActiveTab] = useState("Stories");

  const user = useMemo(
    () => ({
      id: "u_123",
      name: "Maya Arman",
      username: "maya",
      bio: "Writer, designer, and curious human. I write about product design, learning, and the occasional longform essay.",
      location: "Tehran · Remote",
      website: "https://example.com",
      followers: 2140,
      following: 128,
      posts: 48,
      members: 32,
    }),
    [],
  );

  const storyGenerator = useCallback(
    (index) => makeStory(index, isOwner),
    [isOwner],
  );

  const { items: stories, setItems } = useAllStories(16, storyGenerator);
  const storyHeatmap = useMemo(() => buildStoryHeatmap(stories), [stories]);

  const [following, setFollowing] = useState(false);
  const toggleFollow = () => setFollowing((v) => !v);

  const clap = (id) => {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, clapCount: s.clapCount + 1 } : s)),
    );
  };

  return (
    <BlogShell variant="feed">
      <div className="min-h-screen pb-20">
        <header className="border-b border-default pb-12 pt-10 dark:border-dark-default sm:pb-14 sm:pt-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-5">
              <AvatarDemo />
              <div className="min-w-0 flex-1">
                <p className="font-blog-serif text-secondary dark:text-dark-secondary">
                  @{user.username}
                </p>
                <h1 className="font-blog-display mt-2 text-4xl font-bold tracking-tight text-primary md:text-[2.6rem] dark:text-dark-primary">
                  {user.name}
                </h1>
                <p className="font-blog-serif mt-4 max-w-xl text-lg leading-relaxed text-secondary dark:text-dark-secondary">
                  {user.bio}
                </p>
                <p className="mt-4 text-sm text-muted dark:text-dark-muted">
                  {user.location}
                  <span aria-hidden className="mx-2">
                    ·
                  </span>
                  <a
                    href={user.website}
                    className="text-primary underline-offset-4 hover:underline dark:text-dark-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website
                  </a>
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="flex gap-8 text-sm">
                    <span>
                      <strong className="text-lg tabular-nums text-primary dark:text-dark-primary">
                        {user.followers.toLocaleString()}
                      </strong>
                      <span className="ms-2 text-muted dark:text-dark-muted">
                        Followers
                      </span>
                    </span>
                    <span>
                      <strong className="text-lg tabular-nums text-primary dark:text-dark-primary">
                        {user.following}
                      </strong>
                      <span className="ms-2 text-muted dark:text-dark-muted">
                        Following
                      </span>
                    </span>
                  </div>
                  {!isOwner && (
                    <Button
                      onClick={toggleFollow}
                      variant={following ? "secondary" : "primary"}
                      className="rounded-full px-8 text-sm"
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                  )}
                  {isOwner && (
                    <Link
                      to="/write"
                      className="btn-primary inline-flex h-10 items-center rounded-full px-6 text-sm"
                    >
                      Write a story
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="sticky top-[3.25rem] z-[5] -mx-4 border-b border-default bg-shell/95 px-4 py-3 backdrop-blur-sm dark:border-dark-default dark:bg-dark-shell/95 sm:top-14 sm:-mx-6 lg:-mx-8">
          <div className="flex gap-8">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`relative pb-3 text-sm font-medium transition-colors ${
                  activeTab === t
                    ? "text-primary dark:text-dark-primary"
                    : "text-muted hover:text-secondary dark:text-dark-muted dark:hover:text-dark-secondary"
                }`}
              >
                {t}
                {activeTab === t && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary dark:bg-dark-primary" />
                )}
              </button>
            ))}
          </div>
        </nav>

        <main className="pt-10">
          {activeTab === "Stories" && (
            <section className="space-y-10">
              {stories.length > 0 && (
                <article className="border-b border-default pb-12 dark:border-dark-default">
                  <Link
                    to={`/story/${stories[0].id}`}
                    className="group flex cursor-pointer flex-col gap-8 md:flex-row lg:gap-12"
                  >
                    <div className="flex-1 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-success dark:text-success">
                        Featured
                      </p>
                      <h2 className="font-blog-display text-2xl font-bold leading-snug tracking-tight text-primary group-hover:text-secondary md:text-[1.875rem] dark:text-dark-primary dark:group-hover:text-dark-secondary">
                        {stories[0].title}
                      </h2>
                      <p className="font-blog-serif max-w-xl text-secondary dark:text-dark-secondary">
                        {stories[0].subtitle}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted dark:text-dark-muted">
                        <span>{stories[0].readTime} min read</span>
                        <span>·</span>
                        <span>{stories[0].date}</span>
                      </div>
                    </div>
                    <img
                      src={stories[0].cover}
                      alt=""
                      className="aspect-[16/10] w-full rounded-md object-cover md:max-w-sm lg:max-w-md"
                    />
                  </Link>
                </article>
              )}

              <div>
                <h3 className="mb-8 font-blog-display text-lg font-bold text-secondary dark:text-dark-secondary">
                  All stories <span className="text-muted">{stories.length}</span>
                </h3>
                <div className="divide-y divide-default dark:divide-dark-default">
                  {stories.slice(1).map((s) => (
                    <article
                      key={s.id}
                      className="flex flex-col gap-5 py-9 first:pt-0 md:flex-row md:justify-between lg:gap-10"
                    >
                      <div className="min-w-0 flex-1 space-y-3">
                        <Link
                          to={`/story/${s.id}`}
                          className="group block space-y-3"
                        >
                          <h3 className="font-blog-display text-xl font-bold leading-snug text-primary group-hover:text-secondary dark:text-dark-primary dark:group-hover:text-dark-secondary md:text-[1.25rem]">
                            {s.title}
                          </h3>
                          <p className="font-blog-serif line-clamp-2 max-w-xl text-secondary dark:text-dark-secondary">
                            {s.subtitle}
                          </p>
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted dark:text-dark-muted">
                          <span>{s.date}</span>
                          <span>·</span>
                          <span>{s.readTime} min read</span>
                          <button
                            type="button"
                            onClick={() => clap(s.id)}
                            className="text-primary hover:underline dark:text-dark-primary"
                          >
                            👏 {s.clapCount.toLocaleString()}
                          </button>
                          {s.draft && (
                            <span className="rounded-full border border-default px-2 py-0.5 text-xs dark:border-dark-default">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <Link to={`/story/${s.id}`} className="shrink-0 md:w-48">
                        <img
                          src={s.cover}
                          alt=""
                          className="aspect-[4/3] w-full rounded-sm object-cover"
                        />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "About" && (
            <section className="mx-auto max-w-xl space-y-10">
              <div>
                <h2 className="font-blog-display text-2xl font-bold text-primary dark:text-dark-primary">
                  About {user.name}
                </h2>
                <p className="font-blog-serif mt-4 text-lg leading-relaxed text-secondary dark:text-dark-secondary">
                  {user.bio}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    Reach
                  </h3>
                  <dl className="mt-6 space-y-4 text-secondary dark:text-dark-secondary">
                    <div className="flex justify-between gap-4">
                      <dt>Followers</dt>
                      <dd className="font-semibold text-primary dark:text-dark-primary">
                        {user.followers.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Stories</dt>
                      <dd className="font-semibold text-primary dark:text-dark-primary">
                        {user.posts}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Member reads</dt>
                      <dd className="font-semibold text-primary dark:text-dark-primary">
                        {user.members}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-xl border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    Newsletter
                  </h3>
                  <p className="mt-4 text-secondary dark:text-dark-secondary">
                    Writers you follow surface in your homepage feed — same idea
                    as Medium’s following graph.
                  </p>
                  {!isOwner ? (
                    <Button
                      onClick={toggleFollow}
                      variant="secondary"
                      className="mt-6 rounded-full"
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="rounded-xl border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                  Publishing activity
                </h3>
                <div className="mt-5">
                  <ContributionHeatmap
                    weeks={storyHeatmap.weeks}
                    max={storyHeatmap.max}
                    valueLabel="stories"
                    emptyLabel="No stories"
                    xAxisLabel="Weeks"
                    yAxisLabel="Days"
                  />
                </div>
              </div>
            </section>
          )}
        </main>

        <section className="mt-16 border-t border-default pt-16 dark:border-dark-default">
          <h2 className="font-blog-display text-xl font-bold text-primary md:text-2xl dark:text-dark-primary">
            Writers worth following
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-default bg-shell p-5 transition-colors hover:border-primary hover:shadow-md dark:border-dark-default dark:bg-dark-shell dark:hover:border-dark-primary"
              >
                <AvatarDemo />
                <h4 className="mt-4 font-semibold text-primary dark:text-dark-primary">
                  Writer {i}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-secondary dark:text-dark-secondary">
                  Design, systems, and longform notes from the field.
                </p>
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-5 rounded-full text-sm !py-2"
                >
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </BlogShell>
  );
}
