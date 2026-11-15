import { existsSync, lstatSync, readlinkSync, rmSync, symlinkSync } from "node:fs";

// Bun does not hoist, so @types/react exists only under the app. The converter
// finds React's types by walking up from the package dir for node_modules/@types/react;
// without them every `ComponentPropsWithoutRef<"x">["onClick"]` collapses to a wrong type.
export const APP_NODE_MODULES = "../../app/node_modules";

/** Point `<pkg>/node_modules` at the app's node_modules. */
export function linkAppNodeModules(pkg) {
  const nm = `${pkg}/node_modules`;
  // A clone made before the app/ rename keeps a link to apps/portfolio-web, which may
  // be dangling or may still resolve. Either way the target is wrong, so compare the
  // link text itself rather than checking whether it resolves. lstat, not exists:
  // exists follows the link. A real directory is left alone; rm on it would be destructive.
  let nmIsLink = false;
  try { nmIsLink = lstatSync(nm).isSymbolicLink(); } catch {}
  if (nmIsLink && readlinkSync(nm) !== APP_NODE_MODULES) {
    rmSync(nm);
    nmIsLink = false;
  }
  if (!nmIsLink && !existsSync(nm)) symlinkSync(APP_NODE_MODULES, nm);
}
