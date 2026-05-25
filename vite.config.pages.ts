// Build config for static deployment to GitHub Pages.
// Disables the Cloudflare worker build and emits a prerendered SPA shell
// (dist/client/index.html) that GitHub Pages can serve statically.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// configure-pages emits base_path like "/torontosheltermap" (no trailing
// slash); Vite needs a leading and trailing slash. Normalize either form.
function normalizeBase(raw: string | undefined): string {
  const value = raw && raw.length > 0 ? raw : "/torontosheltermap/";
  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

const base = normalizeBase(process.env.PAGES_BASE);

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: { outputPath: "/index.html" },
    },
  },
  vite: {
    base,
    // Prerendering spins up a Vite preview server; bind IPv4 so it works in
    // CI runners where binding to "::" (IPv6) may be unavailable.
    preview: { host: "127.0.0.1" },
  },
});