import { createFileRoute } from "@tanstack/react-router";
import { Stakeout } from "@/components/Stakeout";

export const Route = createFileRoute("/stakeout/")({
  component: Stakeout,
  head: () => ({
    meta: [
      { title: "Volunteer stakeout — Find Esti" },
      {
        name: "description",
        content:
          "Sign up for a 2-hour shift at a Toronto shelter or drop-in centre to help look for Esti. Observe, don't approach, and call the tip line if you see her.",
      },
      { property: "og:title", content: "Volunteer stakeout — Find Esti" },
      {
        property: "og:description",
        content:
          "Sign up for a 2-hour shift at a Toronto shelter to help look for missing teen Esti.",
      },
    ],
  }),
});
