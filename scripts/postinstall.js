#!/usr/bin/env node
const readline = require("readline");
const fs = require("fs").promises;
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
  try {
    console.log("Bem-vindo ao SwiftSpec! Vamos configurar algumas opções para você.");

    // Diretório das rotas da API
    config.apiDir = await question("Qual o diretório das rotas da API? (padrão: ./src/routes): ");
    config.apiDir = path.resolve(config.apiDir || "./src/routes");

    // Diretório de saída da documentação
    config.docsDir = await question("Qual o diretório de saída da documentação? (padrão: ./docs): ");
    config.docsDir = path.resolve(config.docsDir || "./docs");

    // Criar diretório de docs se não existir
    try {
      await fs.mkdir(config.docsDir, { recursive: true });
      console.log(`Diretório ${config.docsDir} criado ou já existe.`);
    } catch (error) {
      console.error(`Erro ao criar diretório ${config.docsDir}: ${error.message}`);
    }

    // Porta do servidor
    config.port = await question("Em qual porta você quer que o servidor rode? (padrão: 3000): ");
    config.port = parseInt(config.port || "3000", 10);
    if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
      throw new Error("Porta inválida. Usando porta padrão 3000.");
    }

    // Confirmação
    console.log("\nConfiguração atual:");
    console.log(JSON.stringify(config, null, 2));
    const confirm = await question("\nEstas configurações estão corretas? (S/n): ");
    if (confirm.toLowerCase() !== "s" && confirm !== "") {
      console.log("Configuração cancelada. Execute o script novamente para reconfigurar.");
      process.exit(0);
    }

    // Salvar configurações
    const configPath = path.join(process.cwd(), "swiftspec.config.json");
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    console.log(`Configurações salvas em ${configPath}`);
    console.log("Você pode editar este arquivo manualmente a qualquer momento.");
  } catch (error) {
    console.error("Erro durante a configuração:", error.message);
  } finally {
    rl.close();
  }
}

setupConfig().catch(console.error);
