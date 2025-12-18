# Purchase Order Alert System

## Description

This is a Purchase Request Management Application built with SAP Cloud Application Programming Model (CAP) and SAP Fiori Elements.

## Features

- Purchase Request management with draft support
- Purchase flow process tracking
- Purchase process timeline visualization
- Advanced filtering and analytics
- Multi-language support (English, Chinese)

## Prerequisites

- Node.js (>=20)
- npm or pnpm
- SAP Cloud Foundry CLI (for deployment)

## Installation

```bash
npm install
```

## Running Locally

```bash
npm run watch
```

Or to open the demo app directly:

```bash
npm run watch-demo
```

## Deployment

Build and deploy to SAP BTP:

```bash
mbt build -t mta_archives
cf deploy mta_archives/purchase-request-app_<version>.mtar
```

## Project Structure

- `/db` - Database schema and data
- `/srv` - Service definitions and implementations
- `/app/demo` - Fiori Elements application
- `/mta.yaml` - Multi-Target Application deployment descriptor

## License

This file is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.