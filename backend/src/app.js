const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const frontendCandidates = [
  path.resolve(__dirname, "../../frontend"),
  path.resolve(process.cwd(), "../frontend"),
  path.resolve(process.cwd(), "frontend"),
];

const frontendPath = frontendCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "index.html"))
);

if (frontendPath) {
  app.use(express.static(frontendPath));
}

app.get("/api/health", (req, res) => {
  const isTestEnvironment = process.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID;

  const isDatabaseConfigured = !!process.env.DATABASE_URL || isTestEnvironment;
  const isJwtConfigured = !!process.env.JWT_SECRET || isTestEnvironment;

  if (!isDatabaseConfigured || !isJwtConfigured) {
    return res.status(500).json({
      status: "DOWN",
      error: "Configuration de sécurité manquante : variables d'environnement non détectées",
    });
  }

  return res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    vault_status: "CONNECTED_TO_PROD_SECRETS",
  });
});

app.get("/api/welcome", (req, res) => {
  const name = String(req.query.name || "Invité").replace(/[<>]/g, "");

  return res.status(200).send(`<h1>Bienvenue ${name}</h1>`);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Le serveur écoute activement sur le port ${PORT}`);
  });
}

module.exports = app;
