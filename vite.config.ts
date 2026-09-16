import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@firebase/auth") || id.includes("firebase/auth")) return "firebase-auth";
          if (id.includes("@firebase/firestore") || id.includes("firebase/firestore")) return "firebase-firestore";
          if (id.includes("@firebase/storage") || id.includes("@firebase/functions")) return "firebase-extra";
          if (id.includes("@firebase") || id.includes("/firebase/")) return "firebase-core";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) return "react";
          return undefined;
        },
      },
    },
  },
});
