const fs = require("fs");
const acorn = require("acorn");
const walk = require("acorn-walk");

function parseFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");
    const comments = [];

    acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: "module",
      onComment: (block, text) => {
        if (block && text.startsWith("*")) {
          comments.push(text);
        }
      },
    });

    console.log(`Encontrados ${comments.length} comentários de API em ${filePath}`);
    const parsedComments = comments.map(parseComment);
    console.log(`Comentários parseados:`, parsedComments);

    const undocumentedEndpoints = identifyUndocumentedEndpoints(code);
    console.log(`Endpoints não documentados encontrados:`, undocumentedEndpoints);

    return { parsedComments, undocumentedEndpoints };
  } catch (error) {
    console.error(`Erro ao ler ou analisar o arquivo ${filePath}:`, error);
    return { parsedComments: [], undocumentedEndpoints: [] };
  }
}

function identifyUndocumentedEndpoints(code) {
  const ast = acorn.parse(code, {
    ecmaVersion: 2020,
    sourceType: "module",
  });

  const undocumentedEndpoints = [];
  const httpMethods = ["get", "post", "put", "delete", "patch"];

  walk.simple(ast, {
    CallExpression(node) {
      if (node.callee.type === "MemberExpression") {
        if (httpMethods.includes(node.callee.property.name)) {
          addEndpoint(node, node.callee.property.name);
        }
      }
    },
  });

  function addEndpoint(node, method) {
    if (node.arguments[0] && node.arguments[0].type === "Literal") {
      const path = node.arguments[0].value;
      const params = extractParams(node);
      undocumentedEndpoints.push({ method, path, params });
    }
  }

  function extractParams(node) {
    if (node.arguments[1] && node.arguments[1].type === "FunctionExpression") {
      return node.arguments[1].params.map((param) => (param.type === "ObjectPattern" ? param.properties.map((prop) => prop.key.name) : param.name));
    }
    return [];
  }

  return undocumentedEndpoints;
}

function parseComment(comment) {
  const lines = comment.trim().split("\n");
  const apiInfo = {
    method: "",
    path: "",
    summary: "",
    description: "",
    version: "",
    name: "",
    group: "",
    params: [],
    success: [],
    error: [],
    successExample: "",
    errorExample: [],
    sampleRequest: "",
    headers: [],
    securityDefinition: "",
    security: [],
    deprecated: false,
    deprecatedMessage: "",
  };

  let currentSection = null;
  let multilineDescription = "";
  let currentExample = "";

  lines.forEach((line) => {
    line = line.trim().replace(/^\* ?/, ""); // Remove o '*' no início do comentário

    if (line.startsWith("@api ")) {
      const [, method, path, ...summaryParts] = line.split(" ");
      apiInfo.method = method.replace(/[{}]/g, ""); // Remove chaves desnecessárias
      apiInfo.path = path;
      apiInfo.summary = summaryParts.join(" ");
    } else if (line.startsWith("@apiName")) {
      apiInfo.name = line.replace("@apiName", "").trim();
    } else if (line.startsWith("@apiGroup")) {
      apiInfo.group = line.replace("@apiGroup", "").trim();
    } else if (line.startsWith("@apiVersion")) {
      apiInfo.version = line.replace("@apiVersion", "").trim();
    } else if (line.startsWith("@apiDescription")) {
      currentSection = "description";
      multilineDescription = line.replace("@apiDescription", "").trim();
    } else if (line.startsWith("@apiParam")) {
      currentSection = null;
      apiInfo.params.push(parseParamOrResponse(line, "@apiParam"));
    } else if (line.startsWith("@apiSuccess")) {
      currentSection = null;
      apiInfo.success.push(parseParamOrResponse(line, "@apiSuccess"));
    } else if (line.startsWith("@apiError")) {
      currentSection = null;
      apiInfo.error.push(parseParamOrResponse(line, "@apiError"));
    } else if (line.startsWith("@apiSuccessExample")) {
      currentSection = "successExample";
      currentExample = "";
    } else if (line.startsWith("@apiErrorExample")) {
      currentSection = "errorExample";
      currentExample = "";
    } else if (line.startsWith("@apiSampleRequest")) {
      currentSection = null;
      apiInfo.sampleRequest = line.replace("@apiSampleRequest", "").trim();
    } else if (line.startsWith("@apiHeader")) {
      currentSection = null;
      apiInfo.headers.push(parseParamOrResponse(line, "@apiHeader"));
    } else if (line.startsWith("@apiSecurityDefinition")) {
      currentSection = null;
      apiInfo.securityDefinition = line.replace("@apiSecurityDefinition", "").trim();
    } else if (line.startsWith("@apiDeprecated")) {
      currentSection = null;
      apiInfo.deprecated = true;
      apiInfo.deprecatedMessage = line.replace("@apiDeprecated", "").trim();
    } else if (line.startsWith("@apiSecurity")) {
      currentSection = null;
      apiInfo.security.push(line.replace("@apiSecurity", "").trim());
    } else if (currentSection === "description") {
      multilineDescription += " " + line;
    } else if (currentSection === "successExample") {
      currentExample += line + "\n";
    } else if (currentSection === "errorExample") {
      currentExample += line + "\n";
    }
  });

  // Finaliza a agregação de seções com múltiplas linhas
  apiInfo.description = multilineDescription.trim();

  if (currentSection === "successExample") {
    apiInfo.successExample = currentExample.trim();
  } else if (currentSection === "errorExample") {
    apiInfo.errorExample.push(currentExample.trim());
  }

  // Remova as linhas em branco extras no início e no fim dos exemplos
  if (apiInfo.successExample) {
    apiInfo.successExample = apiInfo.successExample.replace(/^\s+|\s+$/g, "");
  }
  apiInfo.errorExample = apiInfo.errorExample.map((example) => example.replace(/^\s+|\s+$/g, ""));

  console.log("Parsed API Info:", apiInfo); // Para debug

  return apiInfo;
}

function parseParamOrResponse(line, tag) {
  const parts = line.replace(tag, "").trim().split(/\s+/);
  const group = parts[0].startsWith("(") ? parts.shift().replace(/[()]/g, "") : undefined;
  const [type, name, ...descriptionParts] = parts;

  return {
    group,
    type: type.replace(/[{}]/g, ""),
    name: name.replace(/[[$$]/g, ""), // Remove colchetes
    description: descriptionParts.join(" "),
    optional: name.includes("[") && name.includes("]"),
  };
}

module.exports = { parseFile, identifyUndocumentedEndpoints, parseComment };
