import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "itk-wasm",
      "@itk-wasm/image-io",
      "@itk-wasm/dicom",
      "@thewtex/zstddec",
    ],
  },

  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "../../node_modules/@itk-wasm/image-io/dist/pipelines/*.{js,wasm,wasm.zst}",
          dest: "pipelines/",
        },
        {
          src: "../../node_modules/@itk-wasm/dicom/dist/pipelines/*.{js,wasm,wasm.zst}",
          dest: "pipelines/",
        },
      ],
    }),
  ],
  server: {
    port: 5173,
  },
});
