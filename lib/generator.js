// lib/generator.js
const fs = require("fs");
const path = require("path");
const { parseFile } = require("./parser");
const { generateExecutionReport } = require("./generatorReport");

function generateDocs(templateDir, outputDir) {
  const fullOutputDir = path.resolve(process.cwd(), outputDir);

  try {
    if (!fs.existsSync(fullOutputDir)) {
      fs.mkdirSync(fullOutputDir, { recursive: true });
    }

    // Copiar a imagem do logo para a pasta de destino
    const sourceLogoPath = path.join(__dirname, "../assets/swiftspec-logo-w.png");
    const destLogoPath = path.join(fullOutputDir, "assets/swiftspec-logo-w.png");

    // Criar a pasta assets se não existir
    const assetsDir = path.join(fullOutputDir, "assets");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Copiar o arquivo do logo
    fs.copyFileSync(sourceLogoPath, destLogoPath);

    const { apiInfoList, undocumentedEndpoints } = generateApiInfoList(templateDir);

    generateMainPage(apiInfoList, fullOutputDir);
    generateAboutPage(fullOutputDir);
    generateExecutionReport(apiInfoList, undocumentedEndpoints, fullOutputDir);

    console.log(`Documentação gerada em ${fullOutputDir}`);
  } catch (error) {
    console.error(`Erro ao gerar documentação: ${error.message}`);
  }
}

function generateApiInfoList(templateDir) {
  const files = fs.readdirSync(templateDir).filter((file) => file.endsWith(".js"));
  let apiInfoList = [];
  let undocumentedEndpoints = {};

  for (const file of files) {
    const filePath = path.join(templateDir, file);
    const { parsedComments, undocumentedEndpoints: fileUndocumented } = parseFile(filePath);
    apiInfoList = apiInfoList.concat(parsedComments);
    undocumentedEndpoints[file] = fileUndocumented;
  }

  return { apiInfoList, undocumentedEndpoints };
}

function generateMainPage(apiInfoList, outputDir) {
  console.log("API Info List for HTML generation:", JSON.stringify(apiInfoList, null, 2));
  const templatePath = path.join(__dirname, "../templates/swiftspec.html");
  const outputPath = path.join(outputDir, "index.html");

  try {
    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, "utf-8");
      const jsonEncoded = encodeURIComponent(JSON.stringify(apiInfoList));
      console.log("Encoded API Info:", jsonEncoded);
      let htmlContent = template.replace("{{API_DOCS_JSON}}", jsonEncoded);
      console.log("HTML content after replacement:", htmlContent.substring(0, 500) + "..."); // Primeiros 500 caracteres

      fs.writeFileSync(outputPath, htmlContent);
      const generatedContent = fs.readFileSync(outputPath, "utf-8");
      console.log("Generated HTML file content:", generatedContent.substring(0, 1000) + "..."); // Primeiros 1000 caracteres
      console.log(`Página principal de documentação gerada em ${outputPath}`);
    } else {
      throw new Error(`Template da página principal não encontrado em ${templatePath}`);
    }
  } catch (error) {
    console.error(`Erro ao gerar página principal: ${error.message}`);
  }
}

function generateAboutPage(outputDir) {
  const aboutTemplatePath = path.join(__dirname, "../templates/about.html");
  const aboutOutputPath = path.join(outputDir, "about.html");

  try {
    if (fs.existsSync(aboutTemplatePath)) {
      let aboutContent = fs.readFileSync(aboutTemplatePath, "utf-8");
      fs.writeFileSync(aboutOutputPath, aboutContent);
      console.log(`Página "Sobre" gerada em ${aboutOutputPath}`);
    } else {
      throw new Error(`Template da página "Sobre" não encontrado em ${aboutTemplatePath}`);
    }
  } catch (error) {
    console.error(`Erro ao gerar página "Sobre": ${error.message}`);
  }
}

module.exports = { generateDocs };
