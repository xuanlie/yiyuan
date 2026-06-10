import type { ParsedSchema, ModelDef } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function toGoType(field: any): string {
  switch (field.type) {
    case 'string': return 'string';
    case 'number': return 'float64';
    case 'integer': return 'int';
    case 'boolean': return 'bool';
    default: return 'interface{}';
  }
}

function goStruct(modelName: string, modelDef: ModelDef): string {
  const fields = Object.entries(modelDef.fields)
    .map(([name, field]) => `\t${name.charAt(0).toUpperCase() + name.slice(1)} ${toGoType(field)} \`json:"${name}"\``)
    .join('\n');
  return `type ${modelName} struct {\n${fields}\n}`;
}

function handlerFile(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `package handlers

import (
  "github.com/gofiber/fiber/v2"
)

var ${lower}Store []${modelName}

func Create${modelName}(c *fiber.Ctx) error {
  var item ${modelName}
  if err := c.BodyParser(&item); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": err.Error()})
  }
  ${lower}Store = append(${lower}Store, item)
  return c.Status(201).JSON(item)
}

func Get${modelName}s(c *fiber.Ctx) error {
  return c.JSON(${lower}Store)
}

func Get${modelName}(c *fiber.Ctx) error {
  id := c.Params("id")
  for _, item := range ${lower}Store {
    // if item.ID == id { ... }
  }
  return c.Status(404).JSON(fiber.Map{"error": "not found"})
}

func Update${modelName}(c *fiber.Ctx) error {
  id := c.Params("id")
  var updated ${modelName}
  if err := c.BodyParser(&updated); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": err.Error()})
  }
  // update logic
  return c.Status(404).JSON(fiber.Map{"error": "not found"})
}

func Delete${modelName}(c *fiber.Ctx) error {
  id := c.Params("id")
  // delete logic
  return c.Status(404).JSON(fiber.Map{"error": "not found"})
}
`;
}

export class FiberBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    let models = 'package models\n\n';
    for (const [name, def] of Object.entries(schema.models)) {
      models += goStruct(name, def) + '\n\n';
    }
    files['models/models.go'] = models;

    for (const name of Object.keys(schema.models)) {
      files[`handlers/${name.toLowerCase()}.go`] = handlerFile(name);
    }

    let mainGo = `package main

import (
  "log"
  "github.com/gofiber/fiber/v2"
  "your-project/models"
  "your-project/handlers"
)

func main() {
  app := fiber.New()

  api := app.Group("/api")
  {
`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      mainGo += `    api.Post("/${lower}s", handlers.Create${name})\n`;
      mainGo += `    api.Get("/${lower}s", handlers.Get${name}s)\n`;
      mainGo += `    api.Get("/${lower}s/:id", handlers.Get${name})\n`;
      mainGo += `    api.Put("/${lower}s/:id", handlers.Update${name})\n`;
      mainGo += `    api.Delete("/${lower}s/:id", handlers.Delete${name})\n`;
    }
    mainGo += `  }\n\n  log.Fatal(app.Listen(":3000"))\n}\n`;
    files['main.go'] = mainGo;

    return files;
  }
}
