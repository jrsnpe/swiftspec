#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const { generateDocs } = require("../lib/generator");
const { startServer } = require("../lib/server");
const packageJson = require("../package.json");

const [, , command, ...args] = process.argv;

function printUsage() {
  console.log("SwiftSpec - Documentação de API rápida e impressionante");
  console.log("\nUsage:");
  console.log("  swiftspec generate [templateDir] [outputDir]");
  console.log("  swiftspec serve [docsDir] [port]");
  console.log("  swiftspec --version");
  console.log("\nExamples:");
  console.log("  swiftspec generate ./templates ./docs");
  console.log("  swiftspec serve ./docs 8080");
}

function handleGenerate() {
  const templateDir = path.resolve(args[0] || path.join(__dirname, "../example-api"));
  const outputDir = path.resolve(args[1] || "./docs");

  if (!fs.existsSync(templateDir)) {
    console.error(`Erro: O diretório de templates ${templateDir} não existe.`);
    process.exit(1);
  }

  console.log(`Gerando documentação a partir de ${templateDir}`);
  generateDocs(templateDir, outputDir);
}

function handleServe() {
  const docsDir = path.resolve(args[0] || "./docs");
  const port = parseInt(args[1]) || 3000;

  if (!fs.existsSync(docsDir)) {
    console.error(`Erro: O diretório de documentação ${docsDir} não existe.`);
    process.exit(1);
  }

  startServer(docsDir, port);
}

switch (command) {
  case "--version":
    console.log(`SwiftSpec version ${packageJson.version}`);
    break;

  case "generate":
    handleGenerate();
    break;

  case "serve":
    handleServe();
    break;

  default:
    printUsage();
    process.exit(1);
}
