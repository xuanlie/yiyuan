import type { ParsedSchema } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function generateDto(modelName: string, fields: Record<string, any>): string {
  const lines = Object.entries(fields).map(([name, field]) => {
    const type = field.type === 'number' ? 'number' : 'string';
    return `  @ApiProperty()\n  ${name}: ${type};`;
  }).join('\n\n');
  return `import { ApiProperty } from '@nestjs/swagger';

export class Create${modelName}Dto {\n${lines}\n}\n
export class Update${modelName}Dto {\n${lines}\n}`;
}

function generateService(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { Injectable } from '@nestjs/common';
import { getDB } from '../db';

@Injectable()
export class ${modelName}Service {
  async create(data: any) { return getDB().create('${lower}', data); }
  async findAll() { return getDB().findMany('${lower}'); }
  async findOne(id: string) { return getDB().findOne('${lower}', { id }); }
  async update(id: string, data: any) { return getDB().update('${lower}', { id }, data); }
  async remove(id: string) { return getDB().delete('${lower}', { id }); }
}`;
}

function generateController(modelName: string): string {
  const lower = modelName.toLowerCase();
  const svc = `${modelName}Service`;
  const dtoCreate = `Create${modelName}Dto`;
  const dtoUpdate = `Update${modelName}Dto`;
  return `import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${svc} } from './${lower}.service';
import { ${dtoCreate}, ${dtoUpdate} } from './${lower}.dto';

@ApiTags('${lower}s')
@Controller('api/${lower}s')
export class ${modelName}Controller {
  constructor(private readonly service: ${svc}) {}

  @Post()
  create(@Body() dto: ${dtoCreate}) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: ${dtoUpdate}) { return this.service.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}`;
}

function generateModule(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { Module } from '@nestjs/common';
import { ${modelName}Controller } from './${lower}.controller';
import { ${modelName}Service } from './${lower}.service';

@Module({
  controllers: [${modelName}Controller],
  providers: [${modelName}Service],
})
export class ${modelName}Module {}`;
}

export class NestJSBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    for (const [name, def] of Object.entries(schema.models)) {
      const lower = name.toLowerCase();
      files[`modules/${lower}/${lower}.dto.ts`] = generateDto(name, def.fields);
      files[`modules/${lower}/${lower}.service.ts`] = generateService(name);
      files[`modules/${lower}/${lower}.controller.ts`] = generateController(name);
      files[`modules/${lower}/${lower}.module.ts`] = generateModule(name);
    }

    let appModule = `import { Module } from '@nestjs/common';`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      appModule += `\nimport { ${name}Module } from './modules/${lower}/${lower}.module';`;
    }
    appModule += `\n\n@Module({ imports: [${Object.keys(schema.models).map(m => m + 'Module').join(', ')}] })\nexport class AppModule {}`;
    files['app.module.ts'] = appModule;

    files['db.provider.ts'] = `import { Provider } from '@nestjs/common';
export const DB_PROVIDER = 'DATABASE_CONNECTION';
export const databaseProvider: Provider = {
  provide: DB_PROVIDER,
  useFactory: () => { return {}; },
};`;

    files['main.ts'] = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder().setTitle('Yiyuan API').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(3456);
  console.log(\`NestJS server running on http://localhost:3456\`);
}
bootstrap();`;

    return files;
  }
}
