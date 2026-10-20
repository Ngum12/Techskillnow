// Lets Node's test runner load the app's TypeScript: maps "@/x" to the project root and adds ".ts" to bare relative imports.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(process.cwd() + "/").href;

const hooks = `
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = ${JSON.stringify(root)};
export async function resolve(specifier, context, next) {
  const s = specifier.startsWith("@/") ? new URL(specifier.slice(2), root).href : specifier;
  if ((s.startsWith(".") || s.startsWith("file:")) && !/\\.[cm]?[jt]sx?$/.test(s)) {
    const url = new URL(s, context.parentURL).href;
    for (const ext of [".ts", ".tsx", "/index.ts"]) {
      if (existsSync(fileURLToPath(url + ext))) return next(url + ext, context);
    }
  }
  return next(s, context);
}
`;

register("data:text/javascript," + encodeURIComponent(hooks));
