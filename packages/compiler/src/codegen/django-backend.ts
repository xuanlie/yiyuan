import type { ParsedSchema, ModelDef } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function toDjangoField(field: any): string {
  switch (field.type) {
    case 'string': return 'models.CharField(max_length=255)';
    case 'number': return 'models.FloatField()';
    case 'integer': return 'models.IntegerField()';
    case 'boolean': return 'models.BooleanField()';
    default: return 'models.CharField(max_length=255)';
  }
}

export class DjangoBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    let modelsPy = 'from django.db import models\n\n';
    for (const [modelName, modelDef] of Object.entries(schema.models)) {
      const fields = Object.entries(modelDef.fields)
        .map(([name, field]) => `    ${name} = ${toDjangoField(field)}`)
        .join('\n');
      modelsPy += `class ${modelName}(models.Model):\n${fields}\n\n`;
    }
    files['models.py'] = modelsPy;

    let viewsPy = 'from rest_framework import viewsets\nfrom .models import *\nfrom .serializers import *\n\n';
    for (const modelName of Object.keys(schema.models)) {
      viewsPy += `class ${modelName}ViewSet(viewsets.ModelViewSet):\n    queryset = ${modelName}.objects.all()\n    serializer_class = ${modelName}Serializer\n\n`;
    }
    files['views.py'] = viewsPy;

    let serializersPy = 'from rest_framework import serializers\nfrom .models import *\n\n';
    for (const [modelName, modelDef] of Object.entries(schema.models)) {
      const fields = Object.keys(modelDef.fields).map(f => `'${f}'`).join(', ');
      serializersPy += `class ${modelName}Serializer(serializers.ModelSerializer):\n    class Meta:\n        model = ${modelName}\n        fields = [${fields}]\n\n`;
    }
    files['serializers.py'] = serializersPy;

    let urlsPy = 'from django.urls import include, path\nfrom rest_framework.routers import DefaultRouter\nfrom .views import *\n\nrouter = DefaultRouter()\n';
    for (const modelName of Object.keys(schema.models)) {
      urlsPy += `router.register(r'${modelName.toLowerCase()}s', ${modelName}ViewSet)\n`;
    }
    urlsPy += `\nurlpatterns = [\n    path('api/', include(router.urls)),\n]\n`;
    files['urls.py'] = urlsPy;

    files['README.md'] = '# Django 生成代码\n将上述文件放入您的 Django 应用的对应目录中，并在主 urls.py 中包含本 urls.py。\n';

    return files;
  }
}
