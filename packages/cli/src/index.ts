#!/usr/bin/env node
import { Command } from 'commander';
import { dev } from './commands/dev';
import { generate } from './commands/generate';
import { init } from './commands/init';
import { create } from './commands/create';
import { add } from './commands/add';
import { deploy } from './commands/deploy';
import { generateFrontend } from './commands/generate-frontend';

const program = new Command();
program.name('yiyuan').description('一元：Schema 驱动的全栈框架').version('0.0.1');

program.command('init').description('初始化项目').argument('[dir]', '项目目录', '.').action((dir: string) => init(dir));

program.command('generate').alias('g').description('从 Schema 生成代码')
  .argument('[schema]', 'Schema 文件路径', 'schema.ts')
  .option('-o, --out <dir>', '输出目录')
  .option('-b, --backend <name>', '后端框架')
  .action(async (schema: string, options: { out?: string; backend?: string }) => {
    await generate(schema, options);
  });

program.command('dev').description('启动开发服务器（自动编译并启动，仅 Hono 后端）')
  .argument('[schema]', 'Schema 文件路径', 'schema.ts')
  .option('-p, --port <number>', '端口号')
  .option('--banner <style>', 'Banner 风格: colorful | simple | none', 'colorful')
  .action(async (schema: string, options: { port?: string; banner?: string }) => {
    await dev(schema, options);
  });

program.command('create').description('交互式创建新项目')
  .argument('[name]', '项目名称（不填则交互式输入）')
  .action(async (name?: string) => {
    await create(name);
  });

program.command('add <type> [name]').description('添加资源 (middleware)').action(async (type: string, name?: string) => {
  await add(type, name);
});

program.command('deploy').description('生成部署文件 (Docker, CI)').action(async () => {
  await deploy();
});

program.command('generate-frontend [schema]').description('生成完整 React 前端项目（含登录和 CRUD 页面）').action(async (schema: string) => {
  await generateFrontend(schema);
});

program.parse();
