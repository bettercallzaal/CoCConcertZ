/**
 * Asserts that NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local matches the
 * cloud name baked into firestore.rules. Run before `firebase:deploy:rules`
 * so we don't ship a rule pinned to the wrong Cloudinary account.
 *
 *   npx tsx scripts/check-cloudinary-rule.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const envCloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
if (!envCloud) {
  console.error(
    "FAIL: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set in .env.local"
  );
  process.exit(1);
}

const rulesPath = path.resolve(process.cwd(), "firestore.rules");
const rules = fs.readFileSync(rulesPath, "utf8");

const pattern = /res\\\\\.cloudinary\\\\\.com\/([a-zA-Z0-9_-]+)/;
const match = rules.match(pattern);
if (!match) {
  console.error("FAIL: could not find Cloudinary host pattern in firestore.rules");
  process.exit(1);
}

const ruleCloud = match[1];
if (ruleCloud !== envCloud) {
  console.error(
    `FAIL: firestore.rules pins cloud name '${ruleCloud}' but .env.local has '${envCloud}'.\n` +
      "Update the regex in firestore.rules > match /gallery/{photoId} to match."
  );
  process.exit(1);
}

console.log(`OK: firestore.rules cloud name '${ruleCloud}' matches env`);
