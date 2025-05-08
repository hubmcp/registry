const fs = require('fs');
const path = require('path');

// Caminhos
const seedPath = path.join(__dirname, '../data/seed.json');
const entriesDir = path.join(__dirname, '../entries');
const today = new Date().toISOString();
const outPath = path.join(entriesDir, `${today}.json`);

// Carrega seed.json
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

// Helper para converter para schema v1
// Remove campos nulos, undefined ou string vazia
function removeEmptyFields(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(removeEmptyFields)
            .filter(v => v !== undefined && v !== null && (typeof v !== 'string' || v.trim() !== ''));
    } else if (obj && typeof obj === 'object') {
        return Object.entries(obj)
            .reduce((acc, [key, value]) => {
                const cleaned = removeEmptyFields(value);
                if (
                    cleaned !== undefined &&
                    cleaned !== null &&
                    (typeof cleaned !== 'string' || cleaned.trim() !== '') &&
                    // também remover arrays vazios e objetos vazios
                    (!(Array.isArray(cleaned)) || cleaned.length > 0) &&
                    (!(typeof cleaned === 'object' && !Array.isArray(cleaned)) || Object.keys(cleaned).length > 0)
                ) {
                    acc[key] = cleaned;
                }
                return acc;
            }, {});
    }
    return obj;
}

// Lê os registries permitidos diretamente do schema
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema/v1/metadata.schema.json'), 'utf-8'));
let allowedRegistries = [];
try {
    // Corrigido para acessar o enum corretamente conforme o schema
    allowedRegistries = (schema.items && schema.items.properties && schema.items.properties.packages && schema.items.properties.packages.items && schema.items.properties.packages.items.properties && schema.items.properties.packages.items.properties.registry && schema.items.properties.packages.items.properties.registry.enum) || [];

} catch (e) {
    console.error('Não foi possível ler allowedRegistries do schema:', e);
    allowedRegistries = [];
}

function convertToV1(entry) {
    // O schema exige: id, name, description, repository (id, url), score, verified, license, packages, remotes
    // Adaptar os campos do seed.json conforme necessário
    return removeEmptyFields({
        // id: entry.id,
        name: entry.name,
        description: entry.description || entry.name,
        license: entry.license && entry.license.trim() !== '' ? entry.license : 'Apache-2.0',
        repository: {
            // id: entry.repository?.name || '',
            url: entry.repository?.url || '',
        },
        packages: (entry.registries || [])
            .filter(pkg => allowedRegistries.includes(pkg.packagename))
            .map(pkg => ({
                registry: pkg.packagename,
                name: pkg.name || '',
                version: {
                    number: String(pkg.version || entry.version || ''),
                    release_date: pkg.release_date || new Date().toISOString(),
                },
                command: (() => {
                    // Garante que todos os campos obrigatórios estejam presentes e válidos
                    const positional = Array.isArray(pkg.commandarguments?.positionalarguments)
                        ? pkg.commandarguments.positionalarguments.map(arg => arg.argument?.name || '').filter(Boolean)
                        : [];
                    let name = '';
                    if (pkg.commandarguments && typeof pkg.commandarguments.name === 'string' && pkg.commandarguments.name.trim() !== '') {
                        name = pkg.commandarguments.name;
                    } else if (positional.length > 0) {
                        name = positional[0];
                    } else {
                        name = 'run';
                    }
                    return {
                        name,
                        subcommands: Array.isArray(pkg.commandarguments?.subcommands)
                            ? pkg.commandarguments.subcommands.filter(s => typeof s === 'string')
                            : [],
                        positional_arguments: positional,
                        named_arguments: Array.isArray(pkg.commandarguments?.namedarguments)
                            ? pkg.commandarguments.namedarguments.map(arg => ({
                                short_flag: arg.argument?.name || '',
                                required: arg.argument?.isrequired || false,
                                description: arg.argument?.description || '',
                            }))
                            : [],
                    };
                })(),
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
    });
}

// Cria a pasta de saída se não existir
if (!fs.existsSync(entriesDir)) {
    fs.mkdirSync(entriesDir);
}
// Remove todos os arquivos antigos exceto README.md
fs.readdirSync(entriesDir).forEach(file => {
    if (file !== 'README.md') {
        fs.unlinkSync(path.join(entriesDir, file));
    }
});

// Converte todos os servers
const v1Entries = seed.map(convertToV1);

// Conta quantos packages foram incluídos no total
const totalPackages = v1Entries.reduce((acc, entry) => acc + (Array.isArray(entry.packages) ? entry.packages.length : 0), 0);

// Escreve o arquivo de saída
fs.writeFileSync(outPath, JSON.stringify(v1Entries, null, 2), 'utf-8');
console.log(`Arquivo salvo em: ${outPath} com ${v1Entries.length} servidores e ${totalPackages} packages incluídos.`);
