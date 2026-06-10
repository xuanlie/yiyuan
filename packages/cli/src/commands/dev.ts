import { compile, loadConfig } from '@yiyuanjs/compiler';
import { startServer } from '@yiyuanjs/server';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const c = {
  reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', green: '\x1b[32m', magenta: '\x1b[35m',
};

function printBanner(style: string, info: { backend: string; provider: string; port: number }) {
  if (style === 'none') return;
  if (style === 'simple') { console.log(`${c.cyan}Yiyuan Framework${c.reset}`); return; }
  console.log(`
${c.magenta}██╗   ██╗${c.cyan}██╗   ${c.yellow}██╗   ██╗ ${c.green}██╗   ██╗ █████╗ ███╗   ██╗${c.reset}
${c.magenta}╚██╗ ██╔╝${c.cyan}██║   ${c.yellow}╚██╗ ██╔╝ ${c.green}██║   ██║██╔══██╗████╗  ██║${c.reset}
${c.magenta} ╚████╔╝ ${c.cyan}██║   ${c.yellow} ╚████╔╝  ${c.green}██║   ██║███████║██╔██╗ ██║${c.reset}
${c.magenta}  ╚██╔╝  ${c.cyan}██║   ${c.yellow}  ╚██╔╝   ${c.green}██║   ██║██╔══██║██║╚██╗██║${c.reset}
${c.magenta}   ██║   ${c.cyan}██████╗${c.yellow}   ██║    ${c.green}╚██████╔╝██║  ██║██║ ╚████║${c.reset}
${c.magenta}   ╚═╝   ${c.cyan}╚═════╝${c.yellow}   ╚═╝    ${c.green} ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝${c.reset}
${c.dim}──────────────────────────────────────────────────────────${c.reset}
${c.bright}  Backend: ${c.cyan}${info.backend}${c.reset}  ${c.bright}DB: ${c.green}${info.provider}${c.reset}  ${c.bright}Port: ${c.yellow}${info.port}${c.reset}
${c.dim}──────────────────────────────────────────────────────────${c.reset}
`);
}

function startFrontend(frontendDir: string) {
  if (!existsSync(frontendDir)) {
    console.log(`${c.yellow}[frontend] No frontend directory found, skipping.${c.reset}`);
    return;
  }

  const pkgJson = join(frontendDir, 'package.json');
  if (!existsSync(pkgJson)) {
    console.log(`${c.yellow}[frontend] No package.json found, skipping.${c.reset}`);
    return;
  }

  // Check if node_modules exist
  if (!existsSync(join(frontendDir, 'node_modules'))) {
    console.log(`${c.cyan}[frontend] Installing dependencies...${c.reset}`);
    const install = spawn('npm', ['install'], { cwd: frontendDir, stdio: 'inherit', shell: true });
    install.on('close', (code) => {
      if (code === 0) runVite(frontendDir);
      else console.log(`${c.yellow}[frontend] npm install failed (code ${code})${c.reset}`);
    });
  } else {
    runVite(frontendDir);
  }
}

function runVite(frontendDir: string) {
  console.log(`${c.green}[frontend] Starting Vite dev server...${c.reset}`);
  const vite = spawn('npx', ['vite'], { cwd: frontendDir, stdio: 'inherit', shell: true });
  vite.on('error', (err) => {
    console.log(`${c.yellow}[frontend] Failed to start: ${err.message}${c.reset}`);
  });
}

export async function dev(schemaPath?: string, options?: { port?: string; banner?: string }) {
  const config = await loadConfig();
  const backend = config.backend || 'hono';
  const outDir = config.outDir || '.yiyuan';
  const schema = schemaPath || 'schema.ts';

  console.log(`${c.cyan}Compiling... backend: ${backend} | output: ${outDir}${c.reset}`);
  await compile({ schemaPath: schema, outDir, backend }, config);

  if (backend === 'hono') {
    const provider = config.datasource?.provider || 'json';
    const dbPath = config.datasource?.url || `${outDir}/data`;
    const port = options?.port ? Number(options.port) : config.server?.port || 3456;
    const bannerStyle = options?.banner || config.server?.banner || 'colorful';
    printBanner(bannerStyle, { backend, provider, port });

    const middlewares = config.middlewares || [];

    // Start frontend dev server in parallel
    const frontendDir = join(process.cwd(), 'frontend');
    startFrontend(frontendDir);

    // Start backend server
    await startServer({ port, dbPath, outDir, provider, middlewares });
  } else {
    console.log(`${c.green}Code generated to ${outDir}${c.reset}`);
  }
}
