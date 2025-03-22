// lib/parser.js
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

  walk.simple(ast, {
    CallExpression(node) {
      if (node.callee.type === "MemberExpression") {
        const httpMethods = ["get", "post", "put", "delete", "patch"];
        if (httpMethods.includes(node.callee.property.name)) {
          addEndpoint(node, node.callee.property.name);
        } else if (node.callee.property.name === "route") {
          const parent = node.parent;
          if (parent && parent.type === "MemberExpression") {
            httpMethods.forEach((method) => {
              if (parent.property.name === method) {
                addEndpoint(parent.parent, method);
              }
            });
          }
        }
      }
    },
  });

  function addEndpoint(node, method) {
    if (node.arguments[0] && node.arguments[0].type === "Literal") {
      const path = node.arguments[0].value;
      const params = extractParams(node);
      const functionBody = node.arguments[1] && node.arguments[1].body;
      const description = extractDescription(functionBody);
      const responseData = extractResponseData(functionBody);

      undocumentedEndpoints.push({
        method,
        path,
        params,
        description,
        responseData,
        suggestedDocs: generateSuggestedDocs(method, path, params, description, responseData),
      });
    }
  }

  function extractParams(node) {
    const params = [];
    if (node.arguments[1] && node.arguments[1].type === "FunctionExpression") {
      node.arguments[1].params.forEach((param) => {
        if (param.type === "ObjectPattern") {
          param.properties.forEach((prop) => params.push(prop.key.name));
        } else {
          params.push(param.name);
        }
      });
    }
    return params;
  }

  function extractDescription(functionBody) {
    if (!functionBody) return "";
    const comments = functionBody.leadingComments || [];
    return comments.map((comment) => comment.value.trim()).join(" ");
  }

  function extractResponseData(functionBody) {
    if (!functionBody) return {};
    let responseData = {};
    walk.simple(functionBody, {
      CallExpression(node) {
        if (node.callee.type === "MemberExpression" && node.callee.object.name === "res" && ["json", "send"].includes(node.callee.property.name)) {
          responseData = analyzeResponseData(node.arguments[0]);
        }
      },
    });
    return responseData;
  }

  function analyzeResponseData(node) {
    if (node.type === "ObjectExpression") {
      return node.properties.reduce((acc, prop) => {
        acc[prop.key.name] = prop.value.type;
        return acc;
      }, {});
    }
    return { data: node.type };
  }

  function generateSuggestedDocs(method, path, params, description, responseData) {
    const capitalizedMethod = method.charAt(0).toUpperCase() + method.slice(1);
    const groupName = path.split("/")[1] || "Default";
    const apiName = `${capitalizedMethod}${path
      .split("/")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("")}`;

    let suggestedDocs = `
/**
 * @api {${method}} ${path} ${description || `${capitalizedMethod} ${groupName}`}
 * @apiName ${apiName}
 * @apiGroup ${groupName}
 * @apiDescription ${description || `Endpoint para ${method.toUpperCase()} ${path}`}
 *
${params.map((param) => ` * @apiParam {String} ${param} Descrição do parâmetro ${param}`).join("\n")}
 *
${Object.entries(responseData)
  .map(([key, type]) => ` * @apiSuccess {${type}} ${key} Descrição do campo ${key}`)
  .join("\n")}
 *
 * @apiError (4xx) {Object} error Mensagem de erro
 *
 * @apiSuccessExample {json} Sucesso:
 *     HTTP/1.1 200 OK
 *     {
${Object.keys(responseData)
  .map((key) => `         "${key}": "Exemplo de ${key}"`)
  .join(",\n")}
 *     }
 *
 * @apiErrorExample {json} Erro:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Mensagem de erro"
 *     }
 */`;

    return suggestedDocs;
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
    params: [],
    success: [],
    error: [],
    successExample: "",
    errorExample: "",
  };

  let currentSection = null;

  lines.forEach((line) => {
    line = line.trim().replace(/^\* ?/, "");

    if (line.startsWith("@api ")) {
      const [, method, path, ...summaryParts] = line.split(" ");
      apiInfo.method = method.replace("{", "").replace("}", "");
      apiInfo.path = path;
      apiInfo.summary = summaryParts.join(" ");
    } else if (line.startsWith("@apiDescription")) {
      apiInfo.description = line.replace("@apiDescription", "").trim();
    } else if (line.startsWith("@apiParam")) {
      apiInfo.params.push(parseParamOrResponse(line, "@apiParam"));
    } else if (line.startsWith("@apiSuccess")) {
      apiInfo.success.push(parseParamOrResponse(line, "@apiSuccess"));
    } else if (line.startsWith("@apiError")) {
      apiInfo.error.push(parseParamOrResponse(line, "@apiError"));
    } else if (line.startsWith("@apiVersion")) {
      apiInfo.version = line.replace("@apiVersion", "").trim();
    } else if (line.startsWith("@apiSuccessExample")) {
      currentSection = "successExample";
    } else if (line.startsWith("@apiErrorExample")) {
      currentSection = "errorExample";
    } else if (currentSection === "successExample") {
      apiInfo.successExample += line + "\n";
    } else if (currentSection === "errorExample") {
      apiInfo.errorExample += line + "\n";
    }
  });

  return apiInfo;
}

function parseParamOrResponse(line, tag) {
  const parts = line.replace(tag, "").trim().split(" ");
  return {
    type: parts[0].replace("{", "").replace("}", ""),
    name: parts[1],
    description: parts.slice(2).join(" "),
  };
}

module.exports = { parseFile, identifyUndocumentedEndpoints, parseComment };
