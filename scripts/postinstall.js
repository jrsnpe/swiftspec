#!/usr/bin/env node
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const config = {};

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupConfig() {
  console.log("Bem-vindo ao SwiftSpec! Vamos configurar algumas opções para você.");

  // Diretório das rotas da API
  config.apiDir = await question("Qual o diretório das rotas da API? (padrão: ./src/routes): ");
  config.apiDir = config.apiDir || "./src/routes";

  // Diretório de saída da documentação
  config.docsDir = await question("Qual o diretório de saída da documentação? (padrão: ./docs): ");
  config.docsDir = config.docsDir || "./docs";

  // Criar diretório de docs se não existir
  if (!fs.existsSync(config.docsDir)) {
    fs.mkdirSync(config.docsDir, { recursive: true });
    console.log(`Diretório ${config.docsDir} criado.`);
  }

  // Porta do servidor
  config.port = await question("Em qual porta você quer que o servidor rode? (padrão: 3000): ");
  config.port = config.port || "3000";

  // Salvar configurações
  const configPath = path.join(process.cwd(), "swiftspec.config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`Configurações salvas em ${configPath}`);
  console.log("Você pode editar este arquivo manualmente a qualquer momento.");

  rl.close();
}

setupConfig().catch(console.error);
