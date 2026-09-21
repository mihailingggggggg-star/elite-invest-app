import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://<user>.github.io/elite-invest-app/
export default defineConfig({
  base: "/elite-invest-app/",
  plugins: [react()],
});
