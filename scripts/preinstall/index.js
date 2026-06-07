// @ts-check
import { generateSecrets } from "./generate-secrets.js";
import { installPostCommit } from "./install-git-hooks.js";

async function main() {
  await installPostCommit();
  await generateSecrets();
  console.log(`
  '+-----------+'
  '| H O O K S |'
  '+-----------+'
  `);
}

main();
