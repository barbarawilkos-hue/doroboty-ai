import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const digest = createHash("sha256");
function fingerprint(relative: string) {
  const filename = path.join(root, relative);
  if (relative.endsWith("/")) {
    for (const entry of readdirSync(filename, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    ))
      fingerprint(relative + entry.name + (entry.isDirectory() ? "/" : ""));
  } else
    digest
      .update(relative + "\0")
      .update(readFileSync(filename))
      .update("\0");
}
for (const entry of [
  "src/",
  "public/",
  "tokens.css",
  "package.json",
  "package-lock.json",
  "index.html",
  "vite.config.ts",
  "docs/design-system/agent-kit/assets/",
])
  fingerprint(entry);
const buildId = digest.digest("hex");
const appVersion = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const release = { appVersion, buildId, builtAt: new Date().toISOString() };

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "release-identity",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "release.json",
          source: JSON.stringify(release, null, 2) + "\n",
        });
      },
    },
  ],
  define: {
    "import.meta.env.VITE_BUILD_ID": JSON.stringify(buildId),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
  },
  base: "./",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
