import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
  'client/src/pages/PerformancePage.tsx',
  'client/src/pages/JournalPage.tsx',
  'client/src/pages/AnalysisPage.tsx',
  'client/src/pages/MarketPage.tsx',
  'client/src/pages/TradesPage.tsx'
];

const replacements = [
  [/bg-gray-950/g, 'bg-background'],
  [/bg-gray-900/g, 'bg-surface'],
  [/bg-gray-800/g, 'bg-surface-muted'],
  [/bg-gray-700/g, 'bg-surface-muted'],
  [/border-gray-800/g, 'border-border'],
  [/border-gray-700/g, 'border-border'],
  [/border-gray-600/g, 'border-border'],
  [/text-gray-300/g, 'text-text-secondary'],
  [/text-gray-400/g, 'text-text-secondary'],
  [/text-gray-500/g, 'text-text-muted'],
  [/text-gray-600/g, 'text-text-muted'],
  [/text-white/g, 'text-text-primary']
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
