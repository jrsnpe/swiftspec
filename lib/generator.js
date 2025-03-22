// lib/generator.js
const fs = require("fs");
const path = require("path");

function generateDocs(apiInfoList, outputDir) {
  const fullOutputDir = path.resolve(process.cwd(), outputDir);
  try {
    if (!fs.existsSync(fullOutputDir)) {
      fs.mkdirSync(fullOutputDir, { recursive: true });
    }

    generateMainPage(apiInfoList, fullOutputDir);
    generateAboutPage(fullOutputDir);

    console.log(`Documentação gerada em ${fullOutputDir}`);
  } catch (error) {
    console.error(`Erro ao gerar documentação: ${error.message}`);
  }
}

function generateMainPage(apiInfoList, outputDir) {
  const templatePath = path.join(__dirname, "../templates/swiftspec.html");
  const outputPath = path.join(outputDir, "index.html");

  try {
    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, "utf-8");
      const jsonEncoded = encodeURIComponent(JSON.stringify(apiInfoList));
      let htmlContent = template.replace("{{API_DOCS_JSON}}", jsonEncoded);

      htmlContent = htmlContent.replace('<div id="header">', `<div id="header" class="d-flex justify-content-between align-items-center">`);

      fs.writeFileSync(outputPath, htmlContent);
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

      const navLinks = `
        <nav>
          <a href="index.html" class="btn btn-outline-dark me-2">Documentação</a>
          <a href="about.html" class="btn btn-outline-dark">Sobre a Ferramenta</a>
        </nav>
      `;
      aboutContent = aboutContent.replace('<div class="container">', `<div class="container">${navLinks}`);

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