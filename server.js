import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;
const app = express();

app.use(express.json());
app.use(cors());

console.log("server.js iniciado");

// --- Conexão com PostgreSQL ---
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

// --- Listar usuários ---
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("ERRO LISTAR USERS:", err.stack || err);
    res.status(500).json({ error: err.stack || err });
  }
});

// --- Cadastro de usuários pelo site/app ---
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

// --- Cadastro de usuários pelo Admin ---
app.post("/api/users", async (req, res) => {
  const { username, password, name, role, currency, country, language, hourlyRate } = req.body;

  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: "Campos obrigatórios: username, password, name, role" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users
       (username, password, name, role, currency, country, language, hourly_rate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [username, password, name, role, currency || 'EUR', country || 'PT', language || 'pt', hourlyRate || 0]
    );

    console.log("Novo usuário criado pelo Admin:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ERRO AO CRIAR USUÁRIO:", err.stack || err);
    res.status(500).json({ error: err.stack || err });
  }
});

// --- Atualizar usuário pelo Admin ---
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, name, role, currency, country, language, hourlyRate } = req.body;

  if (!username || !name || !role) {
    return res.status(400).json({ error: "Campos obrigatórios: username, name, role" });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET
         username=$1,
         password=$2,
         name=$3,
         role=$4,
         currency=$5,
         country=$6,
         language=$7,
         hourly_rate=$8
       WHERE id=$9
       RETURNING *`,
      [username, password || '', name, role, currency || 'EUR', country || 'PT', language || 'pt', hourlyRate || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.log("Usuário atualizado pelo Admin:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERRO AO ATUALIZAR USUÁRIO:", err.stack || err);
    res.status(500).json({ error: err.stack || err });
  }
});

// --- Deletar usuário pelo Admin ---
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.log("Usuário deletado pelo Admin:", result.rows[0]);
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (err) {
    console.error("ERRO AO DELETAR USUÁRIO:", err.stack || err);
    res.status(500).json({ error: err.stack || err });
  }
});

// --- Inicializa servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
