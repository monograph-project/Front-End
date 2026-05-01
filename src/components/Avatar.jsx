import * as React from "react";
import { Avatar } from "radix-ui";

const AvatarDemo = () => (
  <Avatar.Root className="inline-flex aspect-square size-[1.85rem] max-h-full max-w-full select-none items-center justify-center overflow-hidden rounded-[inherit] align-middle sm:size-[2rem]">
    <Avatar.Image
      className="size-full rounded-[inherit] object-cover"
      src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
      alt=""
    />
    <Avatar.Fallback
      className="flex size-full items-center justify-center rounded-[inherit] bg-accent/18 text-[10px] font-semibold uppercase text-primary sm:text-[11px] dark:bg-[rgba(0,102,255,0.22)] dark:text-dark-primary"
      delayMs={600}
    >
      CT
    </Avatar.Fallback>
  </Avatar.Root>
);

export default AvatarDemo;
