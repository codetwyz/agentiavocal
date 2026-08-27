import express from "express";
import cors from "cors";
import { JSONFilePreset } from "lowdb/node";

const app = express();
app.use(cors());
app.use(express.json());

// Base de données simple (fichier JSON). Pour un usage multi-commerces plus tard,
// on ajoutera un champ "businessId" pour séparer les commandes par client.
const db = await JSONFilePreset("orders.json", { orders: [] });

// Clé secrète partagée avec Vapi pour vérifier que l'appel vient bien de lui.
// A définir dans les variables d'environnement Railway (VAPI_SECRET).
const VAPI_SECRET = process.env.VAPI_SECRET || "changeme";

function checkAuth(req, res, next) {
  const secret = req.headers["x-vapi-secret"];
  if (secret !== VAPI_SECRET) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  next();
}

// --- Route de vérification (utile pour tester que le serveur tourne) ---
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Serveur agent fleuriste actif" });
});

// --- Route appelée par Vapi quand l'agent doit enregistrer une commande ---
// Vapi envoie un payload de type "tool call" avec les arguments définis
// dans la configuration de la fonction (voir README).
app.post("/vapi-tool/prendre-commande", checkAuth, async (req, res) => {
  try {
    const args = req.body.message?.toolCalls?.[0]?.function?.arguments || req.body;

    const commande = {
      id: Date.now().toString(),
      date_reception: new Date().toISOString(),
      client_nom: args.client_nom || null,
      client_telephone: args.client_telephone || null,
      occasion: args.occasion || null,
      budget: args.budget || null,
      date_souhaitee: args.date_souhaitee || null,
      mode: args.mode || null, // "retrait" ou "livraison"
      adresse_livraison: args.adresse_livraison || null,
      destinataire: args.destinataire || null,
      notes: args.notes || null,
      statut: "nouvelle",
    };

    db.data.orders.push(commande);
    await db.write();

    console.log("Nouvelle commande enregistrée :", commande);

    // Format de réponse attendu par Vapi pour un "tool call"
    res.json({
      results: [
        {
          toolCallId: req.body.message?.toolCalls?.[0]?.id || "manual",
          result: `Commande enregistrée avec succès, numéro ${commande.id}.`,
        },
      ],
    });
  } catch (err) {
    console.error("Erreur enregistrement commande :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- Route pour consulter les commandes reçues (pour toi, pas pour Vapi) ---
app.get("/commandes", checkAuth, (req, res) => {
  res.json(db.data.orders);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
