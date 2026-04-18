import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import StoryCard from "../../components/StoryCard";
import TopicPills from "../../components/TopicPills";
import TrendingSidebar from "../../components/TrendingSidebar";
import { MOCK_STORIES } from "../../data/mockStories";

export default function Home() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("for-you");

  useEffect(() => {
    const t = setTimeout(() => {
      setStories(MOCK_STORIES);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingSpinner />;

  const forYouStories = stories.slice(0, Math.ceil(stories.length * 0.7));
  const featuredStories = stories.slice(Math.ceil(stories.length * 0.3));

  return (
    <div className="w-full bg-shell dark:bg-dark-shell min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-default dark:border-dark-default mb-8 sticky top-14  bg-shell dark:bg-dark-shell z-10">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("for-you")}
              className={`py-4 px-1 font-medium text-base transition-all border-b-2 ${
                activeTab === "for-you"
                  ? "text-primary dark:text-dark-primary border-accent dark:border-dark-accent"
                  : "text-muted dark:text-dark-muted border-transparent hover:text-secondary dark:hover:text-dark-secondary"
              }`}
            >
              For you
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`py-4 px-1 font-medium text-base transition-all border-b-2 ${
                activeTab === "featured"
                  ? "text-primary dark:text-dark-primary border-accent dark:border-dark-accent"
                  : "text-muted dark:text-dark-muted border-transparent hover:text-secondary dark:hover:text-dark-secondary"
              }`}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Stories Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {(activeTab === "for-you" ? forYouStories : featuredStories)
              .length > 0 ? (
              <>
                {(activeTab === "for-you"
                  ? forYouStories
                  : featuredStories
                ).map((story, idx) => (
                  <div
                    key={story.id}
                    className={`${idx === 0 ? "pb-8" : "pt-8 pb-8"} ${
                      idx !==
                      (activeTab === "for-you"
                        ? forYouStories
                        : featuredStories
                      ).length -
                        1
                        ? "border-b border-default dark:border-dark-default"
                        : ""
                    }`}
                  >
                    <StoryCard
                      story={story}
                      variant={idx === 0 ? "featured" : "default"}
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="py-16 px-6 rounded-lg bg-card dark:bg-dark-card border border-default dark:border-dark-default text-center">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-primary dark:text-dark-primary">
                    No Stories Yet
                  </h2>
                  <p className="text-lg text-secondary dark:text-dark-secondary max-w-md mx-auto">
                    Be the first to share your story and inspire readers around
                    the world.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Staff Picks / Trending */}
          <div className="hidden lg:block">
            <div className="sticky top-32 space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-dark-primary mb-4">
                  Staff Picks
                </h2>
                <div className="space-y-4">
                  {stories.slice(0, 5).map((story) => (
                    <StoryCard key={story.id} story={story} variant="sidebar" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
