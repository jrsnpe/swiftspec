// lib/parser.js
const fs = require("fs");
const acorn = require("acorn");

function parseFile(filePath) {
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

  return parsedComments;
}

function parseComment(comment) {
  const lines = comment.trim().split("\n");
  const apiInfo = {
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
      apiInfo.method = method;
      apiInfo.path = path;
      apiInfo.summary = summaryParts.join(" ");
    } else if (line.startsWith("@apiDescription")) {
      apiInfo.description = line.replace("@apiDescription", "").trim();
    } else if (line.startsWith("@apiParam")) {
      apiInfo.params.push(line.replace("@apiParam", "").trim());
    } else if (line.startsWith("@apiSuccess")) {
      apiInfo.success.push(line.replace("@apiSuccess", "").trim());
    } else if (line.startsWith("@apiError")) {
      apiInfo.error.push(line.replace("@apiError", "").trim());
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

module.exports = { parseFile };
