/** Optional boot timing marks (no PII). */

import fs from "fs";
import os from "os";
import path from "path";

const t0 = Date.now();
const marks: { name: string; ms: number }[] = [];

function enabled(): boolean {
  return (
    process.env.GMFD_BOOT_TIMING === "1" ||
    process.env.GMFD_WRITE_BOOT_PROBE === "1"
  );
}

export function bootMark(name: string): void {
  if (!name || !enabled()) return;
  const ms = Date.now() - t0;
  marks.push({ name, ms });
  try {
    fs.writeFileSync(
      path.join(os.tmpdir(), "gmfd-boot-timing.json"),
      JSON.stringify({ t0, marks }, null, 2)
    );
  } catch {
    /* best-effort */
  }
  console.log(`boot-timing ${name}=${ms}ms`);
}
