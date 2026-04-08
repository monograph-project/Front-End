import { useState, useEffect } from "react";


export default function Home() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const featured = stories[0];
  const rest = stories.slice(1);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Topics */}
      <div className="mb-8 border-b border-border pb-4">
        <TopicPills />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {featured && (
            <div className="mb-8 pb-8 border-b border-border">
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
              <div className="text-center py-20">
                <h2 className="font-heading text-2xl font-bold mb-2">
                  No stories yet
                </h2>
                <p className="text-muted-foreground font-body">
                  Be the first to write a story!
                </p>
              </div>
            )
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0 border-l border-border pl-10">
          <TrendingSidebar />
        </div>
      </div>
    </div>
  );
}
