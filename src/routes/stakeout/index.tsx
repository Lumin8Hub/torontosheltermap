import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Stakeout } from "@/components/Stakeout";

// Search params for /stakeout/. The optional `location` param is the
// locations.external_id (e.g. "covenant-house") so links can be shared
// to focus a specific shelter's slot list:
//   /stakeout/?location=covenant-house
const searchSchema = z.object({
  location: z.string().optional(),
});

export const Route = createFileRoute("/stakeout/")({
  component: Stakeout,
  validateSearch: searchSchema,
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
