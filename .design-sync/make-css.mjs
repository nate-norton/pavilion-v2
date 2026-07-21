// Regenerate the stable design-system stylesheet from the latest Vite build.
// Vite emits the compiled Tailwind CSS with a content hash and absolute
// /assets/ font URLs; the design-sync converter resolves url() relative to
// the stylesheet, so we rewrite them to sibling-relative and copy the fonts
// next to the CSS. Run after `npm run build`. Output (.design-sync/style/) is
// gitignored and regenerated on each sync.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const assets = 'dist/assets';
const cssName = readdirSync(assets).find((f) => /^index-.*\.css$/.test(f));
if (!cssName) { console.error('no dist/assets/index-*.css — run `npm run build` first'); process.exit(1); }
mkdirSync('.design-sync/style', { recursive: true });
const css = readFileSync(join(assets, cssName), 'utf8').replace(/url\(\/assets\//g, 'url(./');
writeFileSync('.design-sync/style/pavilion.css', css);
let n = 0;
for (const f of readdirSync(assets)) if (/\.(woff2?|ttf|otf)$/.test(f)) { copyFileSync(join(assets, f), join('.design-sync/style', f)); n++; }
console.error(`wrote .design-sync/style/pavilion.css (${css.length}b) + ${n} font files`);
