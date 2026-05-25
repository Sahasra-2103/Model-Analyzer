const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const findRepoRoot = () => {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'api', 'index.js'))) {
    return cwd;
  }
  const parent = path.resolve(cwd, '..');
  if (fs.existsSync(path.join(parent, 'api', 'index.js'))) {
    return parent;
  }
  return null;
};

const repoRoot = findRepoRoot();
if (!repoRoot) {
  console.error(
    'Could not find api/index.js. In Vercel → Settings → General, set Root Directory to the repository root (leave empty), not "client".'
  );
  process.exit(1);
}

const clientDir = path.join(repoRoot, 'client');
if (!fs.existsSync(path.join(clientDir, 'package.json'))) {
  console.error('Missing client/package.json');
  process.exit(1);
}

console.log(`Vercel install from repo root: ${repoRoot}`);
execSync('npm install', { stdio: 'inherit', cwd: repoRoot });
execSync('npm install', { stdio: 'inherit', cwd: clientDir });
