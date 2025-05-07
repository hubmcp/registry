const fs = require('fs');
const path = require('path');

// Caminhos
const seedPath = path.join(__dirname, '../data/seed.json');
const entriesDir = path.join(__dirname, '../entries');
const today = new Date().toISOString().slice(0, 10);
const outPath = path.join(entriesDir, `${today}.json`);

// Carrega seed.json
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

// Helper para converter para schema v1
function convertToV1(entry) {
  // O schema exige: id, name, description, repository (id, url), score, verified, license, packages, remotes
  // Adaptar os campos do seed.json conforme necessário
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description || '',
    license: entry.license || '',
    repository: {
      id: entry.repository?.name || '',
      url: entry.repository?.url || '',
    },
    score: typeof entry.score === 'number' ? entry.score : 0,
    verified: typeof entry.verified === 'boolean' ? entry.verified : false,
    packages: (entry.registries || []).map(pkg => ({
      registry: pkg.name || '',
      name: pkg.packagename || '',
      version: {
        number: String(pkg.version || entry.version || ''),
        release_date: pkg.release_date || new Date().toISOString(),
      },
      license: pkg.license || '',
      command: pkg.commandarguments
        ? {
            name: pkg.commandarguments.name || '',
            subcommands: pkg.commandarguments.subcommands || [],
            positional_arguments: (pkg.commandarguments.positionalarguments || []).map(arg => arg.argument?.name || ''),
            named_arguments: (pkg.commandarguments.namedarguments || []).map(arg => ({
              short_flag: arg.argument?.name || '',
              requires_value: arg.argument?.isrequired || false,
              is_required: arg.argument?.isrequired || false,
              description: arg.argument?.description || '',
            })),
          }
        : {
            name: '',
            subcommands: [],
            positional_arguments: [],
            named_arguments: [],
          },
      environment_variables: (pkg.environmentvariables || []).map(env => ({
        name: env.name || '',
        description: env.description || '',
        required: env.isrequired || false,
        default_value: env.defaultvalue || '',
      })),
    })),
    remotes: Array.isArray(entry.remotes)
      ? entry.remotes.map(remote => ({
          transport_type: remote.transport_type || '',
          url: remote.url || '',
        }))
      : [],
  };
}

// Cria a pasta de saída se não existir
if (!fs.existsSync(entriesDir)) {
  fs.mkdirSync(entriesDir);
}

// Converte todos os servers
const v1Entries = seed.map(convertToV1);

// Salva o arquivo
fs.writeFileSync(outPath, JSON.stringify(v1Entries, null, 2), 'utf-8');

console.log(`Arquivo salvo em ${outPath} com ${v1Entries.length} servidores.`);
