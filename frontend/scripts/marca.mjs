// Copia del kit de marca de la app lo que usa la web (DESIGN-WEB.md §9). La app solo se lee.
// Uso: npm run marca   (o REPLICA_APP=/ruta/a/la/app npm run marca)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const web = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [process.env.REPLICA_APP, join(web, "../../replica mobile/zairo"), join(web, "../../replica mobile/zairo/zairo")];
const app = candidates.find((p) => p && existsSync(join(p, "docs/marca/kit")));
if (!app) {
  console.error("No encontré la app con su kit de marca (docs/marca/kit). Indica la ruta con REPLICA_APP.");
  process.exit(1);
}
const kit = join(app, "docs/marca/kit");

function copy(from, to) {
  mkdirSync(dirname(join(web, to)), { recursive: true });
  copyFileSync(join(app, from), join(web, to));
  console.log(`  ${to}`);
}

console.log(`Kit de marca: ${kit}`);

// La geometría tal cual la genera el kit de la app (ícono, flor, palabra, firmas y curvas).
const geometry = readFileSync(join(app, "components/brand/logo-geometry.ts"), "utf8").replace(
  /^\/\/ Generado por [^\n]*\n/,
  "// Copiado de la app (components/brand/logo-geometry.ts) por scripts/marca.mjs: no editar a mano.\n"
);
writeFileSync(join(web, "src/components/brand/logoGeometry.ts"), geometry);
console.log("  src/components/brand/logoGeometry.ts");

// Las líneas de tiempo que usa la web, sacadas de linea-de-tiempo.json del kit.
const motion = JSON.parse(readFileSync(join(kit, "movimiento/linea-de-tiempo.json"), "utf8"));
const timelines = {
  // La bienvenida: la firma horizontal con la ola.
  ola: motion["ola"]["firma-horizontal"],
  // El cierre del registro: la firma vertical que se escribe y florece.
  escribe: motion["se-escribe-y-florece"]["firma-vertical"],
};
writeFileSync(
  join(web, "src/components/brand/logoTimelines.ts"),
  `// Copiado del kit de la app (docs/marca/kit/movimiento/linea-de-tiempo.json) por scripts/marca.mjs:
// no editar a mano. Cuadros clave en ms; ver el tipo Key en logoGeometry.ts.
import type { Timeline } from "./logoGeometry";

export const WEB_TIMELINES = ${JSON.stringify(timelines)} as const satisfies Record<string, Timeline>;
`
);
console.log("  src/components/brand/logoTimelines.ts");

// La pestaña del navegador y el acceso directo del iPhone.
copy("docs/marca/kit/web/favicon.svg", "public/favicon.svg");
copy("docs/marca/kit/web/favicon.ico", "public/favicon.ico");
copy("docs/marca/kit/web/apple-touch-icon.png", "public/apple-touch-icon.png");

// El ícono quieto que muestra index.html mientras carga la app: el del kit, con cada color cambiado
// por su token para que siga el tema (los mismos que usa paintFor() en la app).
const TOKENS = {
  "#FFFFFF": "var(--surface-raised)",
  "#C1C8C3": "var(--border)",
  "#5E6661": "var(--subtle)",
  "#325346": "var(--voice)",
  "#655975": "var(--reply)",
  "#ECDCFD": "var(--reply-soft)",
};
let icon = readFileSync(join(kit, "logo/svg/replica-icono-color-claro.svg"), "utf8")
  .replace(/<title>[^<]*<\/title>\s*/, "")
  .replace(/ width="[^"]*" height="[^"]*"/, ' width="70" height="72" aria-hidden="true"')
  .replace(/\s*\n\s*/g, "");
for (const [hex, token] of Object.entries(TOKENS)) icon = icon.replaceAll(`"${hex}"`, `"${token}"`);
const leftover = icon.match(/#[0-9A-Fa-f]{6}/);
if (leftover) throw new Error(`El ícono del kit trae un color sin token: ${leftover[0]}`);
const htmlPath = join(web, "index.html");
const html = readFileSync(htmlPath, "utf8").replace(
  /<!-- marca:carga -->[\s\S]*?<!-- \/marca:carga -->/,
  `<!-- marca:carga --><div class="carga">${icon}</div><!-- /marca:carga -->`
);
writeFileSync(htmlPath, html);
console.log("  index.html (ícono de carga)");

// La firma sonora del cierre del registro (los demás sonidos ya están en public/sounds).
copy("assets/sounds/firma.wav", "public/sounds/firma.wav");
