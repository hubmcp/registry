# Entries

Place each MCP registry entry as a JSON file in this folder.  
Each file must follow the schema in `schema/metadata.schema.json`.


## Examples

### Standard Input/Output (stdio)

The [stdio](https://modelcontextprotocol.io/docs/concepts/transports#standard-input%2Foutput-stdio) transport enables communication through standard input and output streams. This is particularly useful for local integrations and command-line tools.

```json
[
    {
        "name": "example-mcp",
        "description": "An example MCP package for testing",
        "repository": {
            "url": "https://github.com/registrymcp/example-mcp"
        },
        "packages": [
            {
                "registry": "npm",
                "name": "@registrymcp/example-mcp",
                "version": {
                    "number": "0.1.0",
                    "release_date": "2023-01-01T00:00:00Z"
                },
                "license": "Apache-2.0",
                "command": {
                    "name": "npx",
                    "subcommands": [],
                    "positional_arguments": [],
                    "named_arguments": [
                        {
                            "short_flag": "-y",
                            "required": false,
                            "description": "Skip prompts"
                        }
                    ]
                },
                "environment_variables": [
                    {
                        "name": "API_KEY",
                        "description": "API Key for the example MCP",
                        "required": true,
                        "default_value": ""
                    }
                ]
            }
        ]
    }
]
```

### Server-Sent Events (SSE)

The [SSE](https://modelcontextprotocol.io/docs/concepts/transports#server-sent-events-sse) transport enables server-to-client streaming with HTTP POST requests for client-to-server communication.

```json
[
    {
        "name": "example-mcp",
        "description": "An example MCP package for testing",
        "repository": {
            "url": "https://github.com/registrymcp/example-mcp"
        },
        "remotes": [
            {
                "transport_type": "sse",
                "url": "https://mcp-fs.example.com/sse"
            }
        ]
    }
]
```