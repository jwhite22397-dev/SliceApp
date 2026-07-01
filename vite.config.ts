import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages this is served from https://<user>.github.io/SliceApp/,
// so production builds need the repo name as the base path. Local dev/preview
// stays at the root for convenience.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/SliceApp/" : "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}));
