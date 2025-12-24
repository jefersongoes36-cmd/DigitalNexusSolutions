import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;
const app = express();

app.use(express.json());
app.use(cors()); // permite frontend acessar a API

console.log("server.js iniciado");

// --- Conexão com PostgreSQL do Render ---
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://dns_controlo_user:WhOPnhrahmlfPTJT5etv1QsJS7KkAlHR@dpg-d55s9qf5r7bs73f85110-a.oregon-postgres.render.com/dns_controlo";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Testa a conexão ao iniciar
(async () => {
  try {
    const client = await pool.connect();
    console.log("Conexão com o banco estabelecida!");
    client.release();
  } catch (err) {
    console.error("ERRO AO CONECTAR COM O BANCO:", err.stack || err);
  }
})();

// --- Rota teste ---
app.get("/", (req, res) => res.send("API funcionando"));

// --- Listar usuários (admin) ---
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("ERRO LISTAR USERS:", err.stack || err);
    res.status(500).json({ error: err.stack || err });
  }
});

// --- Cadastro de usuários (site/app) ---
app.post("/api/register", async (req, res) => {
  const { name, email, plan } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nome e email obrigatórios" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, plan) VALUES ($1, $2, $3) RETURNING *",
      [name, email, plan || "free"]
    );

    console.log("Novo usuário cadastrado:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ERRO DETALHADO NO CADASTRO:", err.stack || err);
    res.status(500).json({ error: err.stack || err });
  }
});

// --- Inicializa servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
