import * as fs from 'node:fs';
import * as path from 'node:path';

export async function deploy() {
  const cwd = process.cwd();
  const configPath = path.join(cwd, 'yiyuan.config.ts');
  let backend = 'hono';
  try {
    if (fs.existsSync(configPath)) {
      const mod = await import(configPath);
      backend = mod.default.backend || 'hono';
    }
  } catch {}

  // Dockerfile
  let dockerfile = '';
  if (backend === 'hono') {
    dockerfile = `FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --production
COPY . .
RUN pnpm build
EXPOSE 3456
CMD ["pnpm", "dev"]
`;
  } else if (backend === 'express' || backend === 'koa' || backend === 'fastify') {
    dockerfile = `FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --production
COPY . .
CMD ["npx", "tsx", "src/server.ts"]
`;
  } else if (backend === 'fastapi') {
    dockerfile = `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
  } else if (backend === 'gin' || backend === 'fiber') {
    dockerfile = `FROM golang:1.21-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server .
EXPOSE 3000
CMD ["./server"]
`;
  } else {
    dockerfile = `# Generic Dockerfile for ${backend}\n# Please customize`;
  }

  // docker-compose.yml
  const compose = `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3456:3456"
    environment:
      - PORT=3456
      - DATABASE_PROVIDER=json
`;

  // GitHub Actions workflow
  const workflowDir = path.join(cwd, '.github/workflows');
  fs.mkdirSync(workflowDir, { recursive: true });
  const workflow = `name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build and Deploy
      run: |
        docker build -t yiyuan-app .
        docker run -d -p 3456:3456 yiyuan-app
`;
  fs.writeFileSync(path.join(workflowDir, 'deploy.yml'), workflow);

  fs.writeFileSync(path.join(cwd, 'Dockerfile'), dockerfile);
  fs.writeFileSync(path.join(cwd, 'docker-compose.yml'), compose);

  console.log('✅ 部署文件已生成:');
  console.log('   - Dockerfile');
  console.log('   - docker-compose.yml');
  console.log('   - .github/workflows/deploy.yml');
}
