import type { ParsedSchema, ModelDef } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function toPythonType(field: any): string {
  switch (field.type) {
    case 'string': return 'str';
    case 'number': return 'float';
    case 'integer': return 'int';
    case 'boolean': return 'bool';
    default: return 'str';
  }
}

function generateModelCode(modelName: string, modelDef: ModelDef): string {
  const fields = Object.entries(modelDef.fields)
    .map(([name, field]) => `    ${name}: ${toPythonType(field)}`)
    .join('\n');
  return `from pydantic import BaseModel

class ${modelName}(BaseModel):
${fields}
`;
}

function generateRouteCode(modelName: string, modelDef: ModelDef): string {
  const lower = modelName.toLowerCase();
  return `from fastapi import APIRouter, HTTPException
from .models import ${modelName}

router = APIRouter()

db = []

@router.post("/${lower}s", response_model=${modelName})
def create_${lower}(item: ${modelName}):
    db.append(item)
    return item

@router.get("/${lower}s")
def read_${lower}s():
    return db

@router.get("/${lower}s/{item_id}")
def read_${lower}(item_id: str):
    for item in db:
        if getattr(item, 'id', None) == item_id:
            return item
    raise HTTPException(status_code=404, detail="Not found")

@router.put("/${lower}s/{item_id}")
def update_${lower}(item_id: str, updated: ${modelName}):
    for i, item in enumerate(db):
        if getattr(item, 'id', None) == item_id:
            db[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Not found")

@router.delete("/${lower}s/{item_id}")
def delete_${lower}(item_id: str):
    for i, item in enumerate(db):
        if getattr(item, 'id', None) == item_id:
            del db[i]
            return {"detail": "Deleted"}
    raise HTTPException(status_code=404, detail="Not found")
`;
}

export class FastAPIBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    let modelsPy = 'from pydantic import BaseModel\n\n';
    for (const [modelName, modelDef] of Object.entries(schema.models)) {
      modelsPy += generateModelCode(modelName, modelDef) + '\n';
    }
    files['models.py'] = modelsPy;

    let routesPy = 'from fastapi import APIRouter\n';
    for (const modelName of Object.keys(schema.models)) {
      routesPy += `from .${modelName.toLowerCase()}_routes import router as ${modelName.toLowerCase()}_router\n`;
    }
    routesPy += '\nrouter = APIRouter()\n';
    for (const modelName of Object.keys(schema.models)) {
      routesPy += `router.include_router(${modelName.toLowerCase()}_router)\n`;
    }
    files['routes.py'] = routesPy;

    for (const [modelName, modelDef] of Object.entries(schema.models)) {
      files[`${modelName.toLowerCase()}_routes.py`] = generateRouteCode(modelName, modelDef);
    }

    files['main.py'] = `from fastapi import FastAPI
from .routes import router

app = FastAPI()
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Yiyuan generated FastAPI app"}
`;

    return files;
  }
}
