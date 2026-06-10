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

function modelInitCode(modelName: string, modelDef: ModelDef): string {
  const fields = Object.entries(modelDef.fields)
    .map(([name, field]) => `            self.${name} = kwargs.get('${name}')`)
    .join('\n');
  return `class ${modelName}:
    def __init__(self, **kwargs):
${fields}
`;
}

function routeCode(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `from flask import Blueprint, request, jsonify
from models import ${modelName}

${lower}_bp = Blueprint('${lower}', __name__)
store = []

@${lower}_bp.route('/${lower}s', methods=['POST'])
def create_${lower}():
    data = request.get_json()
    item = ${modelName}(**data)
    store.append(item)
    return jsonify(data), 201

@${lower}_bp.route('/${lower}s', methods=['GET'])
def get_${lower}s():
    return jsonify([item.__dict__ for item in store])

@${lower}_bp.route('/${lower}s/<item_id>', methods=['GET'])
def get_${lower}(item_id):
    for item in store:
        if getattr(item, 'id', None) == item_id:
            return jsonify(item.__dict__)
    return jsonify({'error': 'Not found'}), 404

@${lower}_bp.route('/${lower}s/<item_id>', methods=['PUT'])
def update_${lower}(item_id):
    data = request.get_json()
    for item in store:
        if getattr(item, 'id', None) == item_id:
            item.__dict__.update(data)
            return jsonify(item.__dict__)
    return jsonify({'error': 'Not found'}), 404

@${lower}_bp.route('/${lower}s/<item_id>', methods=['DELETE'])
def delete_${lower}(item_id):
    global store
    store = [item for item in store if getattr(item, 'id', None) != item_id]
    return jsonify({'msg': 'Deleted'}), 200
`;
}

export class FlaskBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    let modelsPy = '';
    for (const [modelName, modelDef] of Object.entries(schema.models)) {
      modelsPy += modelInitCode(modelName, modelDef) + '\n';
    }
    files['models.py'] = modelsPy;

    for (const modelName of Object.keys(schema.models)) {
      files[`${modelName.toLowerCase()}_routes.py`] = routeCode(modelName);
    }

    let appPy = `from flask import Flask
from models import *
`;
    for (const modelName of Object.keys(schema.models)) {
      appPy += `from ${modelName.toLowerCase()}_routes import ${modelName.toLowerCase()}_bp\n`;
    }
    appPy += `\napp = Flask(__name__)\n`;
    for (const modelName of Object.keys(schema.models)) {
      appPy += `app.register_blueprint(${modelName.toLowerCase()}_bp, url_prefix='/api')\n`;
    }
    appPy += `\n@app.route('/')\ndef index():\n    return "Yiyuan Flask App"\n`;
    appPy += `\nif __name__ == '__main__':\n    app.run(debug=True)\n`;
    files['app.py'] = appPy;

    return files;
  }
}
