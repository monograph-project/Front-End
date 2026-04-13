import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import TopicPills from "../components/TopicPills";
import { storiesForTopic } from "../data/mockStories";

export default function TopicFeed() {
  const { topic } = useParams();
  const decoded = topic ? decodeURIComponent(topic) : "";
  const stories = useMemo(() => storiesForTopic(topic), [topic]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="mb-8 border-b border-border pb-4">
        <TopicPills activeTopic={decoded} />
      </div>

      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">
          {decoded ? `${decoded}` : "For you"}
        </h1>
        <Link
          to="/"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          All topics
        </Link>
      </div>

      {stories.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground font-body">
          No stories in this topic yet.{" "}
          <Link to="/write" className="text-primary underline-offset-4 hover:underline">
            Write the first one
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-border">
          {stories.map((story) => (
            <div key={story.id} className="py-8 first:pt-0">
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
