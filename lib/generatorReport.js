// lib/generatorReport.js
const fs = require("fs");
const path = require("path");

function generateExecutionReport(apiInfoList, undocumentedEndpoints, outputDir) {
  const templatePath = path.join(__dirname, "../templates/report.html");
  const outputPath = path.join(outputDir, "execution-report.html");

  try {
    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, "utf-8");

      // Replace placeholders for documented APIs
      template = template.replace("{{TOTAL_APIS}}", apiInfoList.length);
      template = template.replace("{{TOTAL_FILES}}", Object.keys(undocumentedEndpoints).length);
      template = template.replace("{{TOTAL_UNDOCUMENTED}}", Object.values(undocumentedEndpoints).flat().length);
      template = template.replace("{{GENERATION_DATE}}", new Date().toLocaleString());

      const tableRows = apiInfoList
        .map(
          (api) => `
        <tr>
          <td>${api.summary || "N/A"}</td>
          <td>${api.method || "N/A"}</td>
          <td>${api.path || "N/A"}</td>
          <td>${api.description || "N/A"}</td>
        </tr>
      `
        )
        .join("");

      template = template.replace("{{API_TABLE_ROWS}}", tableRows);

      // Generate accordion for undocumented endpoints
      let undocumentedAccordion = "";
      Object.entries(undocumentedEndpoints).forEach(([fileName, endpoints], index) => {
        undocumentedAccordion += `
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                ${fileName} (${endpoints.length} endpoints)
              </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#undocumentedAccordion">
              <div class="accordion-body">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Método</th>
                      <th>Caminho</th>
                      <th>Parâmetros Identificados</th>
                      <th>Sugestão de Documentação</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${endpoints
                      .map(
                        (endpoint) => `
                      <tr>
                        <td>${endpoint.method}</td>
                        <td>${endpoint.path}</td>
                        <td>${endpoint.params.join(", ")}</td>
                        <td>
                          <pre>
/**
 * @api {${endpoint.method}} ${endpoint.path} Título da API
 * @apiName ${capitalize(endpoint.method)}${endpoint.path.split("/").map(capitalize).join("")}
 * @apiGroup ${endpoint.path.split("/")[1] || "Default"}
 * @apiDescription Descrição detalhada do que a API faz.
 *
${endpoint.params.map((param) => ` * @apiParam {Type} ${param} Descrição do parâmetro`).join("\n")}
 *
 * @apiSuccess {Object} data Descrição do sucesso
 *
 * @apiError {Object} error Descrição do erro
 */
                          </pre>
                        </td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      });

      template = template.replace("{{UNDOCUMENTED_ENDPOINTS}}", undocumentedAccordion);

      fs.writeFileSync(outputPath, template);
      console.log(`Relatório de execução gerado em ${outputPath}`);
    } else {
      throw new Error(`Template do relatório de execução não encontrado em ${templatePath}`);
    }
  } catch (error) {
    console.error(`Erro ao gerar relatório de execução: ${error.message}`);
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { generateExecutionReport };
