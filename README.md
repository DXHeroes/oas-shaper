# OAS Shaper

This is a simple tool to shape an OpenAPI Specification (OAS) file. It can be used to:

- ✅ Validate OAS by handy rules that are generally standardized.
- 🔧 Fix the OAS with AI

## Usage

Validate an OAS file:

```bash
# NOT WORKING YET!
$ npx oas-shaper validate -f <path-to-oas-file>
```

## Development

### Install dependencies

```bash
$ yarn install
```

### Run the project

```bash
$ yarn start validate -f <path-to-oas-file>

# e.g.
$ yarn start validate -f ./samples/merk.json
```