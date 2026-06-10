import type { ParsedSchema } from '@yiyuan/core';
import type { BackendGenerator, GenerateOptions } from './backend';

function toGraphQLType(field: any): string {
  switch (field.type) {
    case 'string': return 'String';
    case 'number': return 'Float';
    case 'integer': return 'Int';
    case 'boolean': return 'Boolean';
    default: return 'String';
  }
}

export class GraphQLBackend implements BackendGenerator {
  constructor(_opts?: { ui?: string }) {}

  generate(schema: ParsedSchema, options?: GenerateOptions): Record<string, string> {
    const files: Record<string, string> = {};
    const modelNames = Object.keys(schema.models);

    // schema.graphql
    let sdl = '';
    for (const [name, def] of Object.entries(schema.models)) {
      const fields = Object.entries(def.fields)
        .map(([fieldName, field]) => `  ${fieldName}: ${toGraphQLType(field)}`)
        .join('\n');
      sdl += `type ${name} {\n${fields}\n}\n\n`;
    }
    // Queries and Mutations
    sdl += 'type Query {\n';
    modelNames.forEach(name => {
      sdl += `  ${name.toLowerCase()}s: [${name}]\n`;
      sdl += `  ${name.toLowerCase()}(id: ID!): ${name}\n`;
    });
    sdl += '}\n\n';
    sdl += 'type Mutation {\n';
    modelNames.forEach(name => {
      const lower = name.toLowerCase();
      sdl += `  create${name}(data: ${name}Input): ${name}\n`;
      sdl += `  update${name}(id: ID!, data: ${name}Input): ${name}\n`;
      sdl += `  delete${name}(id: ID!): Boolean\n`;
    });
    sdl += '}\n\n';
    // Input types
    for (const [name, def] of Object.entries(schema.models)) {
      const fields = Object.entries(def.fields)
        .map(([fieldName, field]) => `  ${fieldName}: ${toGraphQLType(field)}`)
        .join('\n');
      sdl += `input ${name}Input {\n${fields}\n}\n\n`;
    }
    files['schema.graphql'] = sdl;

    // resolvers.ts
    let resolvers = `import { getDB } from './db';\n\nconst resolvers = {\n  Query: {\n`;
    modelNames.forEach(name => {
      const lower = name.toLowerCase();
      resolvers += `    ${lower}s: () => getDB().findMany('${lower}'),\n`;
      resolvers += `    ${lower}: (_:any, { id }: { id: string }) => getDB().findOne('${lower}', { id }),\n`;
    });
    resolvers += `  },\n  Mutation: {\n`;
    modelNames.forEach(name => {
      const lower = name.toLowerCase();
      resolvers += `    create${name}: (_:any, { data }: any) => getDB().create('${lower}', data),\n`;
      resolvers += `    update${name}: (_:any, { id, data }: any) => getDB().update('${lower}', { id }, data),\n`;
      resolvers += `    delete${name}: (_:any, { id }: any) => getDB().delete('${lower}', { id }).then(() => true),\n`;
    });
    resolvers += `  }\n};\nexport default resolvers;\n`;
    files['resolvers.ts'] = resolvers;

    // server.ts (Apollo Server)
    files['server.ts'] = `import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import resolvers from './resolvers';
import { setDB } from './db';
// Initialize your DB adapter
// Example: import { JsonAdapter } from './json-adapter'; setDB(new JsonAdapter('./data'));

const typeDefs = readFileSync('./schema.graphql', 'utf-8');
const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(\`GraphQL server ready at \${url}\`);
});`;
    files['db.ts'] = `let db: any; export function setDB(d: any) { db = d; } export function getDB() { if (!db) throw new Error('DB not init'); return db; }`;

    return files;
  }
}
