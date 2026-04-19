import { Activity } from "lucide-react";
import { memo } from "react";
import { EmptyState, Panel } from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE } from "../design/tokens";
import { formatRelativeDate } from "../utils/common";

export const ActivityFeed = memo(function ActivityFeed({ palette, isDark, activity }) {
  if (!activity.length) {
    return (
      <EmptyState
        palette={palette}
        icon={Activity}
        title="No activity yet"
        description="Create, update, and delete actions will appear here."
      />
    );
  }

  return (
    <Panel palette={palette}>
      {activity.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 border-b px-4 py-3 last:border-b-0 ${palette.border}`}
        >
          <span className={`mt-1 h-2 w-2 rounded-full ${isDark ? "bg-[#58a6ff]" : "bg-[#0969da]"}`} />
          <div>
            <p className={`${COURSE_SCALE.text.sm} ${palette.text}`}>{item.message}</p>
            <p className={`mt-0.5 ${COURSE_SCALE.text.xs} ${palette.muted}`}>
              {formatRelativeDate(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </Panel>
  );
});
