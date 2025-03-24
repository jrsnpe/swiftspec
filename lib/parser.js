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
    console.log("Parsed comments:", parsedComments);

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
    successExample: null,
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
  let currentExample = null;
  let capturingExample = false;
  let exampleContent = "";

  function finishCapturingExample() {
    if (currentExample) {
      currentExample.content = exampleContent.trim();
      if (currentSection === "successExample") {
        apiInfo.successExample = currentExample;
      } else if (currentSection === "errorExample") {
        apiInfo.errorExample.push(currentExample);
      }
      capturingExample = false;
      currentExample = null;
      exampleContent = "";
    }
  }

  lines.forEach((line) => {
    line = line.trim().replace(/^\* ?/, "");

    if (line.startsWith("@api ")) {
      const [, method, path, ...summaryParts] = line.split(" ");
      apiInfo.method = method.replace(/[{}]/g, "");
      apiInfo.path = path;
      apiInfo.summary = summaryParts.join(" ");
    } else if (line.startsWith("@apiSampleRequest")) {
      apiInfo.sampleRequest = line.replace("@apiSampleRequest", "").trim();
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
      apiInfo.params.push(parseParamOrResponse(line, "@apiParam"));
    } else if (line.startsWith("@apiSuccess")) {
      apiInfo.success.push(parseParamOrResponse(line, "@apiSuccess"));
    } else if (line.startsWith("@apiError")) {
      apiInfo.error.push(parseParamOrResponse(line, "@apiError"));
    } else if (line.startsWith("@apiSuccessExample")) {
      finishCapturingExample();
      currentSection = "successExample";
      currentExample = parseExampleHeader(line, "@apiSuccessExample");
      capturingExample = true;
    } else if (line.startsWith("@apiErrorExample")) {
      finishCapturingExample();
      currentSection = "errorExample";
      currentExample = parseExampleHeader(line, "@apiErrorExample");
      capturingExample = true;
    } else if (line.startsWith("@apiHeader")) {
      apiInfo.headers.push(parseParamOrResponse(line, "@apiHeader"));
    } else if (line.startsWith("@apiSecurityDefinition")) {
      currentSection = "securityDefinition";
      apiInfo.securityDefinition = line.replace("@apiSecurityDefinition", "").trim();
    } else if (line.startsWith("@apiSecurity")) {
      apiInfo.security.push(line.replace("@apiSecurity", "").trim());
    } else if (line.startsWith("@apiDeprecated")) {
      apiInfo.deprecated = true;
      apiInfo.deprecatedMessage = line.replace("@apiDeprecated", "").trim();
    } else if (line.startsWith("@api")) {
      finishCapturingExample();
      currentSection = null;
    } else if (currentSection === "description") {
      multilineDescription += " " + line;
    } else if (currentSection === "securityDefinition") {
      apiInfo.securityDefinition += " " + line;
    } else if (capturingExample) {
      exampleContent += line + "\n";
    }
  });

  // Finaliza a captura de exemplo, se necessário
  finishCapturingExample();

  // Finaliza a descrição
  apiInfo.description = multilineDescription.trim();

  return apiInfo;
}

function parseExampleHeader(line, tag) {
  const match = line.match(new RegExp(`${tag}\\s+{(.+?)}\\s*(.*)`));
  if (match) {
    const [, type, description] = match;
    return {
      type: "Example",
      contentType: type.trim(),
      description: description.trim(),
      content: "",
    };
  }
  return {
    type: "Example",
    contentType: "json",
    description: line.replace(tag, "").trim(),
    content: "",
  };
}

function parseParamOrResponse(line, tag) {
  const parts = line.replace(tag, "").trim().split(/\s+/);

  let group;
  if (parts[0] && parts[0].startsWith("(") && parts[0].endsWith(")")) {
    group = parts.shift().slice(1, -1);
  }

  const type = parts.shift() || "";
  const name = parts.shift() || "";
  const description = parts.join(" ");

  return {
    group,
    type: type.replace(/[{}]/g, ""),
    name: name.replace(/[[$$]/g, ""),
    description,
    optional: name.includes("[") && name.includes("]"),
  };
}

module.exports = { parseFile, identifyUndocumentedEndpoints, parseComment };
