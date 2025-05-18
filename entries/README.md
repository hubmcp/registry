# Entries

Each MCP registry entry must be a JSON file in this folder, following the schema em `schema/v1/metadata.schema.json`.

## Schema Overview

Cada entrada deve ser um objeto com os seguintes campos:

| Campo         | Tipo         | Obrigatório | Descrição                                                    |
|---------------|--------------|-------------|--------------------------------------------------------------|
| name          | string       | Sim         | Nome do pacote                                               |
| description   | string       | Sim         | Descrição do pacote                                          |
| license       | string       | Sim         | Licença (ex: Apache-2.0)                                     |
| repository    | string (uri) | Sim         | URL do repositório                                           |
| packages      | array        | Não         | Lista de pacotes (ver abaixo)                                |

### Estrutura de `packages`

Cada item do array `packages` deve conter:

| Campo        | Tipo     | Obrigatório | Descrição                                                                                   |
|--------------|----------|-------------|---------------------------------------------------------------------------------------------|
| registry     | string   | Sim         | Onde está publicado (enum: npm, github, gitlab, bitbucket, docker, pypi)                    |
| name         | string   | Sim         | Nome do pacote                                                                              |
| version      | string   | Sim         | Versão (semver)                                                                             |
| command      | string   | Sim         | Comando para rodar o pacote                                                                 |
| arguments    | array    | Sim         | Argumentos do comando (ver abaixo)                                                          |
| environment  | array    | Não         | Variáveis de ambiente necessárias (ver abaixo)                                              |

#### Estrutura de `arguments`

Cada item do array `arguments` deve conter:

| Campo       | Tipo   | Obrigatório | Descrição                   |
|-------------|--------|-------------|-----------------------------|
| name        | string | Sim         | Nome do argumento           |
| description | string | Sim         | Descrição do argumento      |
| value       | string | Não         | Valor padrão ou exemplo     |

#### Estrutura de `environment`

Cada item do array `environment` deve conter:

| Campo       | Tipo   | Obrigatório | Descrição                   |
|-------------|--------|-------------|-----------------------------|
| name        | string | Sim         | Nome da variável            |
| description | string | Sim         | Descrição                   |
| value       | string | Não         | Valor padrão ou exemplo     |


## Exemplos 

**[Standard Input/Output (stdio)](https://modelcontextprotocol.io/docs/concepts/transports#standard-input%2Foutput-stdio)**

```json
[
  {
    "name": "example-mcp",
    "description": "An example MCP package for testing",
    "license": "Apache-2.0",
    "repository": "https://github.com/registrymcp/example-mcp",
    "packages": [
      {
        "registry": "npm",
        "name": "@registrymcp/example-mcp",
        "version": "0.1.0",
        "command": "mcp",
        "arguments": [
          {
            "name": "--help",
            "description": "Show help message"
          },
          {
            "name": "--config",
            "description": "Path to config file",
            "value": "./config.json"
          }
        ],
        "environment": [
          {
            "name": "API_KEY",
            "description": "API Key for the example MCP"
          }
        ]
      }
    ]
  }
]
```

**[Server-Sent Events (SSE)](https://modelcontextprotocol.io/docs/concepts/transports#server-sent-events-sse)**

```json
[
  {
    "name": "example-mcp",
    "description": "An example MCP package for testing",
    "license": "Apache-2.0",
    "repository": "https://github.com/registrymcp/example-mcp",
    "remotes": [
      {
        "transport_type": "sse",
        "url": "https://example.com/sse"
      }
    ]
  }
]
``` 

## Observações
- Todos os campos obrigatórios devem estar presentes.
- O campo `packages` é opcional, mas se fornecido, seus campos internos obrigatórios também devem ser respeitados.
- Os exemplos acima seguem exatamente a estrutura definida em `metadata.schema.json`.

## Referências
- [Documentação oficial do MCP](https://modelcontextprotocol.io/docs/concepts/registry)
- [Schema JSON](../schema/v1/metadata.schema.json)