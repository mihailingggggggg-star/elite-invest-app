import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://<user>.github.io/esmar-app/
export default defineConfig({
  base: "/esmar-app/",
  plugins: [react()],
});
