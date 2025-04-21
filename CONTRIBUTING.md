# Contributing to MCP Registry

Thank you for your interest in contributing to the MCP Registry! We welcome improvements, bug reports, and new entries. To make the process smooth, please follow these guidelines.

## Table of Contents

1. [Reporting Issues](#reporting-issues)  
2. [Submitting Changes](#submitting-changes)  
3. [Adding a New Registry Entry](#adding-a-new-registry-entry)  
4. [Running Validation](#running-validation)  
5. [Pull Request Checklist](#pull-request-checklist)  
6. [Code of Conduct](#code-of-conduct)

---

## Reporting Issues

If you find a bug or have a suggestion:

1. Check existing [issues](https://github.com/hubmcp/registry/issues) to see if it’s already been reported.  
2. Open a new issue using the **Issue template**, providing:
   - A clear title  
   - A detailed description of the problem or feature request  
   - Steps to reproduce (for bugs)  

---

## Submitting Changes

1. **Fork** the repository and **clone** your fork locally.  
2. Create a new branch from `main`:
   ```bash
   git checkout -b my-feature-or-fix
   ```
3. Commit your changes with clear, descriptive messages.  
4. Push your branch and open a **Pull Request** against `hubmcp/registry:main`.  

---

## Adding a New Registry Entry

When adding a new MCP to the registry:

1. Place your JSON file in the `entries/` directory.  
2. Name the file `<package-name>.json` (e.g. `my-mcp-plugin.json`).  
3. Ensure it follows the JSON Schema defined in `schema/metadata.schema.json`. Required fields:
   - `name`  
   - `version` (SemVer format)  
   - `description`  
   - `repository` (URL)  
   - `qualityScore` (number between 0 and 1)  
4. Update `entries/README.md` (if present) with any additional context or examples.

---

## Running Validation

Before submitting your PR, run the local validation and build:

```bash
npm install
npm run validate
npm run build
```

- **`npm run validate`** checks all files in `entries/` against the schema.  
- **`npm run build`** regenerates `dist/index.json` from the `entries/` folder.

Your PR CI will also run these checks automatically.

---

## Pull Request Checklist

- [ ] My code follows the project’s style and guidelines.  
- [ ] I have validated my JSON files against the schema.  
- [ ] I regenerated `dist/index.json` (`npm run build`).  
- [ ] My PR has a descriptive title and summary.  
- [ ] All CI checks pass.  

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.
