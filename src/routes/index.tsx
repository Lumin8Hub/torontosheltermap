import { createFileRoute } from "@tanstack/react-router";
import { FindEsti } from "@/components/FindEsti";

export const Route = createFileRoute("/")({
  component: FindEsti,
  head: () => ({
    meta: [
      { title: "Find Esti — Help Bring a Missing Toronto Teen Home" },
      {
        name: "description",
        content:
          "Esti (Esther), 14, has been missing from North York since May 15. How to help, the confirmed timeline, where to search, and who to contact.",
      },
      { property: "og:title", content: "Find Esti — Missing Toronto Teen" },
      {
        property: "og:description",
        content:
          "Community search board for Esti, a missing 14-year-old. Facts, search strategy, an interactive shelter map, and contacts.",
      },
    ],
  }),
});
