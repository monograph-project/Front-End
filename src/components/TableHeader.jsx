import clsx from "clsx";
import { CircleHelp } from "lucide-react";

/** Column defs: `{ title, icon?, hint?, align?, className? }`. */
function TableHeader({ headerData }) {
  return (
    <thead className="table-advanced-thead">
      <tr>
        {headerData?.map((header, index) => (
          <th
            key={index}
            className={clsx(
              "table-advanced-th",
              header.align === "center" && "text-center",
              header.align === "end" && "text-end",
              header.className,
            )}
          >
            <span
              className={clsx(
                "inline-flex max-w-full items-center gap-1.5",
                header.align === "center" && "justify-center",
                header.align === "end" && "justify-end",
              )}
            >
              {header.icon ? (
                <span className="inline-flex shrink-0 text-muted opacity-85 dark:text-dark-muted [&_svg]:size-3.5">
                  {header.icon}
                </span>
              ) : null}
              <span className="min-w-0 leading-tight">{header.title}</span>
              {header.hint ? (
                <CircleHelp
                  className="size-3.5 shrink-0 text-muted opacity-60 dark:text-dark-muted"
                  aria-hidden
                />
              ) : null}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;
