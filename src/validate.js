const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv({ strict: false });
addFormats(ajv);

const schemaPath = path.join(__dirname, "../schema/metadata.schema.json");
const entriesDir = path.join(__dirname, "../entries");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const entryFiles = fs.readdirSync(entriesDir).filter(f => f.endsWith(".json"));

let hasErrors = false;

entryFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(entriesDir, file), "utf8"));
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    hasErrors = true;
    console.error(`Validation errors in ${file}:`, validate.errors);
  } else {
    console.log(`${file} is valid.`);
  }
});

if (hasErrors) {
  process.exit(1);
}
