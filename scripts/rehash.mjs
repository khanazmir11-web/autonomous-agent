// Owner-only: after reviewing a change to a protected file, refresh its hash in tests/protected.test.mjs.
import fs from "node:fs";
import crypto from "node:crypto";

const TEST = new URL("../tests/protected.test.mjs", import.meta.url);
let text = fs.readFileSync(TEST, "utf8");
text = text.replace(/"([^"]+)": "[0-9a-f]*"/g, (line, file) => {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(new URL(`../${file}`, import.meta.url))).digest("hex");
  return `"${file}": "${hash}"`;
});
fs.writeFileSync(TEST, text);
console.log("protected hashes updated");
