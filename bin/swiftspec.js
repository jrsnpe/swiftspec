#!/usr/bin/env node
//bin\swiftspec.js
const path = require("path");
const fs = require("fs");
const { generateDocs } = require("../lib/generator");
const { startServer } = require("../lib/server");
const packageJson = require("../package.json");

const [, , command, ...args] = process.argv;

// Carregar configurações
let config = {};
const configPath = path.join(process.cwd(), "swiftspec.config.json");
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function printUsage() {
  console.log("SwiftSpec - Documentação de API rápida e impressionante");
  console.log("\nUsage:");
  console.log("  swiftspec generate [projectDir] [outputDir]");
  console.log("  swiftspec serve [docsDir] [port]");
  console.log("  swiftspec start [projectDir] [outputDir] [port]");
  console.log("  swiftspec --version");
  console.log("\nExamples:");
  console.log("  swiftspec generate ./meu-projeto ./docs");
  console.log("  swiftspec serve ./docs 8080");
  console.log("  swiftspec start ./meu-projeto ./docs 8080");
}

function handleGenerate() {
  const projectDir = path.resolve(args[0] || config.apiDir || process.cwd());
  const outputDir = path.resolve(args[1] || config.docsDir || "./docs");

  if (!fs.existsSync(projectDir)) {
    console.error(`Erro: O diretório do projeto ${projectDir} não existe.`);
    process.exit(1);
  }

  console.log(`Gerando documentação a partir de ${projectDir}`);
  generateDocs(projectDir, outputDir);
  console.log(`Documentação gerada em ${outputDir}`);
}

function handleServe() {
  const docsDir = path.resolve(args[0] || config.docsDir || "./docs");
  const port = parseInt(args[1] || config.port || 3000);

  if (!fs.existsSync(docsDir)) {
    console.error(`Erro: O diretório de documentação ${docsDir} não existe.`);
    process.exit(1);
  }

  startServer(docsDir, port);
}

function handleStart() {
  const projectDir = path.resolve(args[0] || config.apiDir || process.cwd());
  const outputDir = path.resolve(args[1] || config.docsDir || "./docs");
  const port = parseInt(args[2] || config.port || 3000);

  if (!fs.existsSync(projectDir)) {
    console.error(`Erro: O diretório do projeto ${projectDir} não existe.`);
    process.exit(1);
  }

  console.log(`Gerando documentação a partir de ${projectDir}`);
  generateDocs(projectDir, outputDir);
  console.log(`Documentação gerada em ${outputDir}`);

  console.log(`Iniciando servidor para a documentação em ${outputDir}`);
  startServer(outputDir, port);
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

  case "start":
    handleStart();
    break;

  default:
    printUsage();
    process.exit(1);
}
