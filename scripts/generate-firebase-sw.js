/**
 * Script to generate firebase-messaging-sw.js from template
 * Replaces placeholders with environment variables
 * 
 * Run: node scripts/generate-firebase-sw.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from both .env file and process.env
// Priority: process.env > .env file (for CI/CD compatibility)
function loadEnv() {
    const envPath = join(__dirname, '../.env');
    const env = {};

    // First, load from .env file if it exists (for local development)
    if (existsSync(envPath)) {
        const content = readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key) {
                    env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
    }

    // Then, override with process.env values (for CI/CD like GitHub Actions)
    // This ensures environment variables set in CI/CD take priority
    const envVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
        'VITE_FIREBASE_MEASUREMENT_ID'
    ];

    envVars.forEach(key => {
        if (process.env[key]) {
            env[key] = process.env[key];
        }
    });

    return env;
}

const env = loadEnv();

const templatePath = join(__dirname, '../public/firebase-messaging-sw.template.js');
const outputPath = join(__dirname, '../public/firebase-messaging-sw.js');

// Read template
let template = readFileSync(templatePath, 'utf8');

// Replace placeholders with env values
const replacements = {
    '__FIREBASE_API_KEY__': env.VITE_FIREBASE_API_KEY || '',
    '__FIREBASE_AUTH_DOMAIN__': env.VITE_FIREBASE_AUTH_DOMAIN || '',
    '__FIREBASE_PROJECT_ID__': env.VITE_FIREBASE_PROJECT_ID || '',
    '__FIREBASE_STORAGE_BUCKET__': env.VITE_FIREBASE_STORAGE_BUCKET || '',
    '__FIREBASE_MESSAGING_SENDER_ID__': env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    '__FIREBASE_APP_ID__': env.VITE_FIREBASE_APP_ID || '',
    '__FIREBASE_MEASUREMENT_ID__': env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(placeholder, 'g'), value);
}

// Write output
writeFileSync(outputPath, template, 'utf8');

console.log('✅ Generated firebase-messaging-sw.js from template');
console.log('   Firebase API Key:', env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('   Firebase Project:', env.VITE_FIREBASE_PROJECT_ID || 'Not set');
