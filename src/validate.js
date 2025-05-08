const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv({ strict: false });
addFormats(ajv);

const schemaDir = path.join(__dirname, '../schema');
const entriesDir = path.join(__dirname, '../entries');
const entryFiles = fs.readdirSync(entriesDir).filter(f => f.endsWith('.json'));

const schemaVersions = fs.readdirSync(schemaDir).filter(f => fs.statSync(path.join(schemaDir, f)).isDirectory());
let hasErrors = false;

schemaVersions.forEach(version => {
  const schemaPath = path.join(schemaDir, version, 'metadata.schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.warn(`Schema not found for version ${version}: ${schemaPath}`);
    return;
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  console.log(`\nValidando entradas contra schema version: ${version}`);
  entryFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(entriesDir, file), 'utf8'));
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
      hasErrors = true;
      console.error(`Erros de validação em ${file} (schema ${version}):`, validate.errors);
    } else {
      console.log(`${file} é válido para schema ${version}.`);
    }
  });
});

if (hasErrors) {
  process.exit(1);
}
