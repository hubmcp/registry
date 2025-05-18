const fs = require('fs');
const path = require('path');

// Caminhos
const seedPath = path.join(__dirname, '../data/seed_2025_05_16.json');
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

    // Mapeia packages
    const packages = Array.isArray(entry.packages) ? entry.packages.map(pkg => {

        let registry = pkg.registry_name || pkg.registry || '';
        if (!allowedRegistries.includes(registry)) {
            console.warn(`Registry ${registry} não permitido para ${pkg.name}. Ignorando.`);
            return null;
        }

        let command = registry === 'npm' ? 'npx' : registry === 'pypi' ? 'pip' : registry === 'docker' ? 'docker' : registry === 'github' ? 'gh' : registry === 'gitlab' ? 'gitlab' : registry === 'bitbucket' ? 'bitbucket' : '';

        let argumentsArr = [];
        let environmentArr = [];

        if (pkg.package_arguments && pkg.package_arguments.length > 0) {
            argumentsArr = pkg.package_arguments.map(arg => arg.value || arg.name || '');
        }

        if (pkg.environment_variables && pkg.environment_variables.length > 0) {
            environmentArr = pkg.environment_variables.map(ev => {
                return {
                    name: ev.name,
                    description: ev.description || ''
                }
            });
        }

        if (argumentsArr.length === 0 && command === 'npx') {
            argumentsArr = [{
                name: '-y',
                description: 'Install dependencies'
            }, {
                name: `${pkg.name}@${pkg.version || 'latest'}`,
                description: 'Package name'
            }];
        }

        return {
            registry,
            name: pkg.name || '',
            version: pkg.version || '',
            command,
            arguments: argumentsArr,
            environment: environmentArr
        };
    }) : [];

    return removeEmptyFields({
        name: entry.name,
        description: entry.description || entry.name,
        repository: typeof entry.repository === 'object' && entry.repository.url ? entry.repository.url : (typeof entry.repository === 'string' ? entry.repository : ''),
        packages
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
let v1Entries = seed.map(convertToV1);

// Remove entradas vazias ou nulas
v1Entries = v1Entries.filter(entry => entry !== null && Object.keys(entry).length > 0);

// Conta quantos packages foram incluídos no total
const totalPackages = v1Entries.reduce((acc, entry) => acc + (Array.isArray(entry.packages) ? entry.packages.length : 0), 0);

// Escreve o arquivo de saída
fs.writeFileSync(outPath, JSON.stringify(v1Entries, null, 2), 'utf-8');
console.log(`Arquivo salvo em: ${outPath} com ${v1Entries.length} servidores e ${totalPackages} packages incluídos.`);
