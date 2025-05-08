const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const entriesDir = path.join(__dirname, '../entries');
const files = fs.readdirSync(entriesDir).filter(f => f.endsWith('.json'));
const entries = files.map(f => {
    const content = fs.readFileSync(path.join(entriesDir, f), 'utf-8');
    return JSON.parse(content);
});

const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

// Descobrir todas as versões de schema pela subpasta
distFiles = [];
const schemaDir = path.join(__dirname, '../schema');
const schemaVersions = fs.readdirSync(schemaDir).filter(f => fs.statSync(path.join(schemaDir, f)).isDirectory());

schemaVersions.forEach(version => {
    const schemaPath = path.join(schemaDir, version, 'metadata.schema.json');
    if (!fs.existsSync(schemaPath)) {
        console.warn(`Schema not found for version ${version}: ${schemaPath}`);
        return;
    }
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const ajv = new Ajv({ strict: false });
    addFormats(ajv);
    let allValid = true;
    for (const [i, file] of files.entries()) {
        const validate = ajv.compile(schema);
        const valid = validate(entries[i]);
        if (!valid) {
            allValid = false;
            console.error(`Erro de validação em ${file} para schema ${version}:`, validate.errors);
        }
    }
    if (allValid) {
        const outputFile = `index.${version}.json`;
        fs.writeFileSync(
            path.join(distDir, outputFile),
            JSON.stringify(entries, null, 2)
        );
        distFiles.push(outputFile);
        console.log(`Built dist/${outputFile} with ${entries.length} entries.`);
    } else {
        console.warn(`Build para schema ${version} não realizado devido a erros de validação.`);
    }
});

if (schemaVersions.length === 0) {
    console.warn('Nenhuma versão de schema encontrada. Nenhum arquivo foi gerado em dist/.');
}
