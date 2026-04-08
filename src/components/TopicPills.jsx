import { Link } from "react-router-dom";

const TOPICS = [
  "Technology", "Science", "Programming", "Design", "Business",
  "Health", "Culture", "Politics", "Travel", "Self Improvement",
  "Productivity", "Writing", "AI", "Startups"
];

export default function TopicPills({ activeTopic }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        to="/"
        className={`px-4 py-1.5 rounded-full text-sm font-body whitespace-nowrap transition-colors ${
          !activeTopic
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        For You
      </Link>
      {TOPICS.map((topic) => (
        <Link
          key={topic}
          to={`/topic/${encodeURIComponent(topic)}`}
          className={`px-4 py-1.5 rounded-full text-sm font-body whitespace-nowrap transition-colors ${
            activeTopic === topic
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {topic}
        </Link>
      ))}
    </div>
  );
}