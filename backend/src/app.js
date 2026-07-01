const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Servir le frontend statique pour les tests E2E
app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/api/health", (req, res) => {
  const isDatabaseConfigured = !!process.env.DATABASE_URL;
  const isJwtConfigured = !!process.env.JWT_SECRET;

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

  return res.status(200).json({
    message: `Bienvenue ${name}`,
  });
});

// Ne démarre le serveur que si le fichier est lancé directement
// Cela évite les conflits de port pendant les tests Jest/Supertest
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Le serveur écoute activement sur le port ${PORT}`);
  });
}

module.exports = app;
