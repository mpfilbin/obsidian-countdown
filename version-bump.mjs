import { readFileSync, writeFileSync } from 'fs';

// Reads the target version from package.json so this works both standalone
// (scripts/release.sh) and as an npm lifecycle script.
const { version: targetVersion } = JSON.parse(readFileSync('package.json', 'utf8'));

// Two-space indentation and a trailing newline keep these files Prettier-clean.
const write = (file, data) => writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

// Update manifest.json
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
write('manifest.json', manifest);

// Update versions.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
versions[targetVersion] = minAppVersion;
write('versions.json', versions);

console.log(`Bumped version to ${targetVersion}`);
