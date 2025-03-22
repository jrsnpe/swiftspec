// lib/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

function getMockUsers() {
  return [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      createdAt: "2023-03-20T10:30:00Z",
      address: {
        street: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
      },
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      createdAt: "2023-03-21T14:15:00Z",
      address: {
        street: "Avenida Principal, 456",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "20000-000",
      },
    },
  ];
}

function startServer(docsPath, port = 3000) {
  const app = express();
  const users = getMockUsers();

  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use(express.static(docsPath));

  app.get("/api/users", (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {
        users: users.slice(startIndex, endIndex),
        totalPages: Math.ceil(users.length / limit),
        currentPage: page,
      };

      res.json(results);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/users/:id", (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        return res.status(400).json({
          error: "ID inválido",
          details: "O ID fornecido não é um número válido.",
        });
      }

      const user = users.find((u) => u.id === userId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({
          error: "Usuário não encontrado",
          details: "Não foi possível encontrar um usuário com o ID fornecido.",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/", (req, res) => {
    const indexPath = path.join(docsPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Documentação não encontrada. Por favor, gere a documentação primeiro.");
    }
  });

  app.get("/about", (req, res) => {
    const aboutPath = path.join(docsPath, "about.html");
    if (fs.existsSync(aboutPath)) {
      res.sendFile(aboutPath);
    } else {
      res.status(404).send("Página 'Sobre' não encontrada. Por favor, gere a documentação completa.");
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
  });

  app
    .listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
      console.log(`Documentação da API disponível em http://localhost:${port}`);
    })
    .on("error", (err) => {
      console.error("Erro ao iniciar o servidor:", err);
    });
}

module.exports = { startServer };
