#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';

const PLUGIN_ID = 'obsidian-countdown';
const FILES_TO_COPY = ['main.js', 'manifest.json', 'styles.css'];

// Get vault path from command line arguments
const vaultPath = process.argv[2];

if (!vaultPath) {
	console.error('Usage: npm run install-to-vault -- <vault-path>');
	console.error('Example: npm run install-to-vault -- ~/Documents/MyVault');
	process.exit(1);
}

const resolvedVaultPath = resolve(vaultPath);

// Verify vault exists
if (!existsSync(resolvedVaultPath)) {
	console.error(`Error: Vault path does not exist: ${resolvedVaultPath}`);
	process.exit(1);
}

// Check for .obsidian directory
const obsidianDir = join(resolvedVaultPath, '.obsidian');
if (!existsSync(obsidianDir)) {
	console.error(`Error: Not a valid Obsidian vault (missing .obsidian directory): ${resolvedVaultPath}`);
	process.exit(1);
}

// Create plugins directory if it doesn't exist
const pluginsDir = join(obsidianDir, 'plugins');
if (!existsSync(pluginsDir)) {
	mkdirSync(pluginsDir, { recursive: true });
	console.log(`Created plugins directory: ${pluginsDir}`);
}

// Create plugin directory
const pluginDir = join(pluginsDir, PLUGIN_ID);
if (!existsSync(pluginDir)) {
	mkdirSync(pluginDir, { recursive: true });
	console.log(`Created plugin directory: ${pluginDir}`);
}

// Copy files from dist directory
const distDir = resolve(import.meta.dirname, '..', 'dist');

for (const file of FILES_TO_COPY) {
	const src = join(distDir, file);
	const dest = join(pluginDir, file);

	if (!existsSync(src)) {
		console.error(`Error: Source file not found: ${src}`);
		console.error('Make sure to run "npm run build" first.');
		process.exit(1);
	}

	copyFileSync(src, dest);
	console.log(`Copied: ${file}`);
}

console.log(`\n✓ Plugin installed to: ${pluginDir}`);
console.log('\nNext steps:');
console.log('1. Open Obsidian and go to Settings → Community plugins');
console.log('2. Enable "Countdown Timer" in the plugin list');
console.log('3. If you don\'t see it, try clicking "Reload plugins" or restart Obsidian');
