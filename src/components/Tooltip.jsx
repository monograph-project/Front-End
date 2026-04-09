import * as React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "../lib/utils";
const TooltipComponent = React.forwardRef(
  ({ content, children, side = "top", sideOffset = 5, className }, ref) => (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            ref={ref}
            side={side}
            sideOffset={sideOffset}
            className={cn(
              "select-none rounded px-3 py-2.5 text-sm leading-none shadow-lg outline-none",
              "bg-white text-primary dark:bg-dark-card dark:text-white border border-default dark:border-dark-card",
              "will-change-[transform,opacity] data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
              className,
            )}
          >
            {content}
            <Tooltip.Arrow className="fill-white dark:fill-dark-card" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  ),
);

TooltipComponent.displayName = "TooltipComponent";

export default TooltipComponent;
