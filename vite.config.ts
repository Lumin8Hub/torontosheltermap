// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.

// When DEPLOY_TARGET=github-pages is set (by .github/workflows/deploy.yml), we build a
// fully-static SPA suitable for GitHub Pages: the Cloudflare Worker plugin is disabled
// and TanStack Start runs in `spa` mode with prerender enabled so each route gets a
// real HTML file. In every other context (Lovable preview, local dev, default
// production build) behavior is unchanged.
const isGithubPages = process.env.DEPLOY_TARGET === "github-pages";
// The Pages workflow sets BASE_PATH=/torontosheltermap/ (the project page lives at
// https://lumin8hub.github.io/torontosheltermap/). For Lovable preview, local dev,
// and Cloudflare builds we serve from the root so assets resolve correctly.
const basePath = process.env.BASE_PATH ?? (isGithubPages ? "/torontosheltermap/" : "/");

export default defineConfig({
  cloudflare: isGithubPages ? false : undefined,
  tanstackStart: isGithubPages
    ? {
        // SPA mode emits a `_shell.html` shell that we use as the GitHub Pages
        // 404 fallback so client-side routes still work on a hard refresh.
        spa: {
          enabled: true,
        },
        // Top-level prerender: this is where TanStack Start actually reads
        // `pages` from. Each listed route is rendered to its own HTML file
        // under `dist/client/<route>/index.html` for real per-page SEO.
        prerender: {
          enabled: true,
          crawlLinks: true,
          autoSubfolderIndex: true,
        },
        // Public routes only. /stakeout/admin (Phase D) MUST stay out of this
        // list and unlinked from any prerendered page — the crawler follows
        // Link targets, and we don't want admin paths emitted as static HTML.
        pages: [{ path: "/" }, { path: "/stakeout" }],
      }
    : undefined,
  ...(basePath !== "/" ? { vite: { base: basePath } } : {}),
});
