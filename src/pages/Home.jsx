import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StoryCard from "../components/StoryCard";
import TopicPills from "../components/TopicPills";
import TrendingSidebar from "../components/TrendingSidebar";
import { MOCK_STORIES } from "../data/mockStories";

export default function Home() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setStories(MOCK_STORIES);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, []);

  const featured = stories[0];
  const rest = stories.slice(1);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full px-2 py-3 sm:px-3 lg:px-4">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="min-w-0 flex-1">
          {featured && (
            <div className="mb-8 border-b border-border pb-8">
              <StoryCard story={featured} variant="featured" />
            </div>
          )}

          {rest.length > 0 ? (
            <div>
              {rest.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            !featured && (
              <div className="py-20 text-center">
                <h2 className="mb-2 font-heading text-2xl font-bold">
                  No stories yet
                </h2>
                <p className="font-body text-muted-foreground">
                  Be the first to write a story!
                </p>
              </div>
            )
          )}
        </div>

        {/* <div className="hidden w-80 border-l border-border pl-10 lg:block">
          <TrendingSidebar />
        </div> */}
      </div>
    </div>
  );
}
