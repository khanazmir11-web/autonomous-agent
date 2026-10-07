// Fails if the agent edits its own rules or scripts. Only the owner updates these hashes
// (after reviewing the change) with: npm run rehash
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

const PROTECTED = {
  "CONSTITUTION.md": "156c06c4f30f69265499227617423cd7bc19e7362bd1a5a879cb0fbdfacaf928",
  "AGENT.md": "16997341742b67be785737617ecdbe61fef8377a2e53be7b814e36f63634e440",
  "scripts/stripe-sales.mjs": "69e0c9d488dc4417930b2c3d9dbd228ac36f4b99b05adbc4fe74287ead8c2322",
  "scripts/tier.mjs": "ab0b8b146d8bba49e2cd856060c10b2c09a2fa96097f404416e66816c96936b7",
  "scripts/rehash.mjs": "be7fea4ebe56e7f4f524f1ee00bd16bcee8fff02e8914ef3c495e65b61fa98a4",
};

const sha256 = (p) =>
  crypto.createHash("sha256").update(fs.readFileSync(new URL(`../${p}`, import.meta.url))).digest("hex");

test("protected files are unchanged", () => {
  for (const [file, hash] of Object.entries(PROTECTED)) {
    assert.equal(sha256(file), hash, `${file} was modified; restore it with: git checkout HEAD -- ${file}`);
  }
});
