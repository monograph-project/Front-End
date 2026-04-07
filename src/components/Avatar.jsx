import * as React from "react";
import { Avatar } from "radix-ui";

const AvatarDemo = () => (
  <div className="flex gap-5">
    <Avatar.Root className="inline-flex size-8.75 select-none items-center justify-center overflow-hidden rounded-full bg-blackA1 align-middle">
      <Avatar.Image
        className="size-full rounded-[inherit] object-cover"
        src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
        alt="Colm Tuite"
      />
      <Avatar.Fallback
        className="leading-1 flex size-full items-center justify-center bg-white text-[15px] font-medium text-violet11"
        delayMs={600}
      >
        CT
      </Avatar.Fallback>
    </Avatar.Root>
  </div>
);

export default AvatarDemo;
