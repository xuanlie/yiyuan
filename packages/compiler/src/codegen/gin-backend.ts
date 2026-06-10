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

function generateStruct(modelName: string, modelDef: ModelDef): string {
  const fields = Object.entries(modelDef.fields)
    .map(([name, field]) => `\t${name.charAt(0).toUpperCase() + name.slice(1)} ${toGoType(field)} \`json:"${name}"\``)
    .join('\n');
  return `type ${modelName} struct {\n${fields}\n}`;
}

function generateHandlerFile(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `package handlers

import (
  "net/http"
  "github.com/gin-gonic/gin"
)

var ${lower}Store []${modelName}

func Create${modelName}(c *gin.Context) {
  var item ${modelName}
  if err := c.ShouldBindJSON(&item); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }
  ${lower}Store = append(${lower}Store, item)
  c.JSON(http.StatusCreated, item)
}

func Get${modelName}s(c *gin.Context) {
  c.JSON(http.StatusOK, ${lower}Store)
}

func Get${modelName}(c *gin.Context) {
  id := c.Param("id")
  for _, item := range ${lower}Store {
    // handle id matching
  }
  c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
}

// ... other CRUD handlers
`;
}

export class GinBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    let models = 'package models\n\n';
    for (const [name, def] of Object.entries(schema.models)) {
      models += generateStruct(name, def) + '\n\n';
    }
    files['models/models.go'] = models;

    for (const name of Object.keys(schema.models)) {
      files[`handlers/${name.toLowerCase()}.go`] = generateHandlerFile(name);
    }

    files['main.go'] = `package main

import (
  "github.com/gin-gonic/gin"
  "your-project/handlers"
)

func main() {
  r := gin.Default()
  api := r.Group("/api")
  {
    // routes will be generated here
  }
  r.Run()
}
`;
    return files;
  }
}
