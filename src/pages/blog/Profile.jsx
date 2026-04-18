import React, { useMemo, useState } from "react";
import AvatarDemo from "../../components/Avatar.jsx";
import Button from "../../components/Button.jsx";

const TABS = ["Stories", "About"];

// Small helpers to simulate content and pagination
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

// Load all stories at once using useMemo
const useAllStories = (totalCount, generate) => {
  const [items, setItems] = useState(() => {
    // Generate all stories upfront in initial state
    return Array.from({ length: totalCount }, (_, i) => generate(i + 1));
  });

  return { items, setItems };
};

export default function Profile() {
  // Assume current viewer; toggle to true to simulate owner features
  const [isOwner] = useState(true);
  const [activeTab, setActiveTab] = useState("Stories");

  const user = useMemo(
    () => ({
      id: "u_123",
      name: "Maya Arman",
      username: "@maya",
      bio: "Writer, designer, and curious human. I write about product design, learning, and the occasional longform essay.",
      location: "Tehran, Remote",
      website: "https://example.com",
      avatarSeed: 42,
      followers: 2140,
      following: 128,
      posts: 48,
      members: 32,
    }),
    [],
  );

  // stories: load all at once
  const storyGenerator = React.useCallback(
    (index) => makeStory(index, isOwner),
    [isOwner],
  );

  const { items: stories, setItems } = useAllStories(
    user.posts,
    storyGenerator,
  );

  // simple interactions
  const [following, setFollowing] = useState(false);
  const toggleFollow = () => setFollowing((v) => !v);

  const clap = (id) => {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, clapCount: s.clapCount + 1 } : s)),
    );
  };

  return (
    <div className="w-full bg-shell dark:bg-dark-shell min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-default dark:border-dark-default bg-shell dark:bg-dark-shell">
        <div className="w-full mx-auto px-4 md:px-16 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            {/* Left: Profile Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <AvatarDemo />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary dark:text-dark-primary">
                    {user.name}
                  </h1>
                  <p className="text-base text-secondary dark:text-dark-secondary mb-4 leading-relaxed max-w-md">
                    {user.bio}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-8 text-sm">
                    <div>
                      <div className="font-semibold text-primary dark:text-dark-primary text-lg">
                        {user.followers.toLocaleString()}
                      </div>
                      <div className="text-muted dark:text-dark-muted text-xs mt-1">
                        Followers
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-primary dark:text-dark-primary text-lg">
                        {user.posts}
                      </div>
                      <div className="text-muted dark:text-dark-muted text-xs mt-1">
                        Stories
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="border-b border-default dark:border-dark-default sticky top-14  bg-shell dark:bg-dark-shell z-10">
        <div className="w-full mx-auto px-4 md:px-6">
          <ul className="flex gap-8 overflow-auto">
            {TABS.map((t) => (
              <li key={t}>
                <button
                  onClick={() => setActiveTab(t)}
                  className={`py-4 px-1 cursor-pointer font-medium text-sm transition-colors border-b-2 ${
                    activeTab === t
                      ? "text-primary dark:text-dark-primary border-accent dark:border-dark-accent"
                      : "text-muted dark:text-dark-muted border-transparent hover:text-secondary dark:hover:text-dark-secondary"
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:max-w-6xl md:max-w-4xl  mx-auto px-4 md:px-3 py-6">
        {activeTab === "Stories" && (
          <section className="space-y-8">
            {/* Featured Story */}
            {stories.length > 0 && (
              <article className="group border-b border-default dark:border-dark-default pb-8 w-full ">
                <div className="flex flex-col md:flex-row gap-6 cursor-pointer transition-opacity hover:opacity-75 w-full">
                  <div className="flex-1">
                    <div className="text-xs font-bold tracking-wider text-accent dark:text-dark-accent mb-2 uppercase">
                      Featured
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary dark:text-dark-primary group-hover:text-secondary dark:group-hover:text-dark-secondary transition-colors">
                      {stories[0].title}
                    </h2>
                    <p className="text-base text-secondary dark:text-dark-secondary mb-4 line-clamp-2 leading-relaxed">
                      {stories[0].subtitle}
                    </p>
                    <div className="flex gap-4 text-sm text-muted dark:text-dark-muted">
                      <span>{stories[0].readTime} min read</span>
                      <span>·</span>
                      <span>{stories[0].date}</span>
                      {stories[0].popular && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-accent dark:text-dark-accent">
                            Popular
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <img
                    src={stories[0].cover}
                    alt={stories[0].title}
                    className="w-full md:w-48 h-32 object-cover rounded shrink-0"
                  />
                </div>
              </article>
            )}

            {/* Stories Grid */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-primary dark:text-dark-primary">
                All stories{" "}
                <span className="text-muted dark:text-dark-muted">
                  ({stories.length})
                </span>
              </h3>
              <div className="space-y-4">
                {stories.slice(1).map((s) => (
                  <article
                    key={s.id}
                    className="group  flex flex-col md:flex-row gap-4 pb-4 border-b border-default dark:border-dark-default hover:bg-card/30 dark:hover:bg-dark-card/30 p-4 -mx-2 transition-colors cursor-pointer last:border-b-0"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 text-primary dark:text-dark-primary group-hover:text-secondary dark:group-hover:text-dark-secondary transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-secondary dark:text-dark-secondary mb-3 line-clamp-2 leading-relaxed">
                        {s.subtitle}
                      </p>
                      <div className="flex gap-4 text-sm text-muted dark:text-dark-muted">
                        <span>{s.readTime} min</span>
                        <span>·</span>
                        <span>{s.date}</span>
                        <button
                          onClick={() => clap(s.id)}
                          className="text-accent dark:text-dark-accent hover:opacity-75 transition-opacity font-medium"
                        >
                          👏 {s.clapCount.toLocaleString()}
                        </button>
                      </div>
                    </div>
                    <img
                      src={s.cover}
                      alt={s.title}
                      className="w-full md:w-32 h-24 object-cover rounded shrink-0"
                    />
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "About" && (
          <section className="max-w-3xl space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-primary dark:text-dark-primary">
                About {user.name}
              </h2>
              <p className="text-lg text-secondary dark:text-dark-secondary leading-relaxed max-w-2xl">
                {user.bio}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-4 rounded-lg bg-card dark:bg-dark-card border border-default dark:border-dark-default">
                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-dark-primary">
                  Stats
                </h3>
                <div className="space-y-3 text-secondary dark:text-dark-secondary">
                  <div className="flex justify-between items-center">
                    <span>Followers</span>
                    <strong className="text-primary dark:text-dark-primary text-lg">
                      {user.followers.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Published Stories</span>
                    <strong className="text-primary dark:text-dark-primary text-lg">
                      {user.posts}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Member-only Stories</span>
                    <strong className="text-primary dark:text-dark-primary text-lg">
                      {user.members}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card dark:bg-dark-card border border-default dark:border-dark-default">
                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-dark-primary">
                  More from {user.name}
                </h3>
                <p className="text-secondary dark:text-dark-secondary text-sm mb-4 leading-relaxed">
                  Follow to get notified about new stories and updates from this
                  writer.
                </p>
                {!isOwner && (
                  <Button onClick={toggleFollow} className="rounded-full">
                    {following ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Related Writers (Sidebar) */}
      <section className="border-t border-default dark:border-dark-default bg-shell dark:bg-dark-shell py-12 md:py-16">
        <div className="max-w-4xl  lg:max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary dark:text-dark-primary">
            More writers you might like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-3 lg:gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group p-5 rounded-lg border border-default dark:border-dark-default bg-shell dark:bg-dark-shell hover:border-nav-hover dark:hover:border-dark-nav-hover hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <AvatarDemo />
                </div>
                <h4 className="font-semibold mb-2 text-primary dark:text-dark-primary group-hover:text-secondary dark:group-hover:text-dark-secondary transition-colors">
                  Writer {i}
                </h4>
                <p className="text-sm text-secondary dark:text-dark-secondary mb-3 line-clamp-2 leading-relaxed">
                  A passionate writer exploring topics in design and technology.
                </p>
                <div className="text-xs text-muted dark:text-dark-muted mb-4 font-medium">
                  12.5K followers · 48 stories
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-full text-sm"
                >
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
