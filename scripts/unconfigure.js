const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "swiftspec.config.json");

if (fs.existsSync(configPath)) {
  fs.unlinkSync(configPath);
  console.log("SwiftSpec configuração removida com sucesso.");
} else {
  console.log("Nenhum arquivo de configuração SwiftSpec encontrado.");
}
