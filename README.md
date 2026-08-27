# Serveur de prise de commande — Guide de déploiement

Ce serveur reçoit les commandes que ton agent Vapi enregistre pendant les appels,
et les stocke dans un fichier `orders.json`.

## 1. Déployer sur Railway (gratuit pour démarrer)

1. Crée un compte sur railway.app (tu peux te connecter avec GitHub)
2. Crée un nouveau dépôt GitHub et mets-y les 3 fichiers de ce dossier
   (`package.json`, `server.js`, ce `README.md`)
3. Dans Railway : "New Project" → "Deploy from GitHub repo" → sélectionne ton dépôt
4. Dans l'onglet "Variables" du projet Railway, ajoute :
   - `VAPI_SECRET` = une phrase secrète de ton choix (ex: `fleuriste-marseille-2026-xk9`)
5. Railway déploie automatiquement. Une fois terminé, il te donne une URL publique
   du type `https://ton-projet.up.railway.app`

## 2. Vérifier que le serveur fonctionne

Ouvre l'URL Railway dans ton navigateur (juste `https://ton-projet.up.railway.app`,
sans rien après). Tu dois voir :
```json
{"status":"ok","message":"Serveur agent fleuriste actif"}
```

## 3. Connecter ce serveur à Vapi (créer la "fonction")

Dans le dashboard Vapi, sur ton Assistant :

1. Va dans la section **"Functions" / "Tools"**
2. Crée une nouvelle fonction nommée `prendre_commande`
3. Description de la fonction (pour que Claude sache quand l'utiliser) :
   ```
   Enregistre une commande de fleurs une fois que toutes les informations
   nécessaires ont été collectées auprès de l'appelant.
   ```
4. Définis ces paramètres (arguments) :

| Nom | Type | Description |
|---|---|---|
| client_nom | string | Nom du client |
| client_telephone | string | Numéro de téléphone du client |
| occasion | string | Occasion (anniversaire, deuil, mariage...) |
| budget | string | Budget approximatif indiqué |
| date_souhaitee | string | Date/heure souhaitée |
| mode | string | "retrait" ou "livraison" |
| adresse_livraison | string | Adresse si livraison (optionnel) |
| destinataire | string | Nom du destinataire si différent du client |
| notes | string | Autres précisions |

5. URL du serveur (webhook) : `https://ton-projet.up.railway.app/vapi-tool/prendre-commande`
6. Méthode : `POST`
7. Header personnalisé à ajouter :
   - `x-vapi-secret` : la même valeur que `VAPI_SECRET` définie sur Railway

## 4. Mettre à jour le prompt système

Ajoute cette ligne à la fin de la section "Ce que tu dois faire" du prompt système
(dans `agent-fleuriste-prototype.md`) :

```
6. Une fois toutes les informations de la commande collectées et confirmées
   à voix haute avec le client, appelle la fonction prendre_commande avec
   ces informations.
```

## 5. Consulter les commandes reçues

Pour voir toutes les commandes enregistrées, ouvre dans ton navigateur :
`https://ton-projet.up.railway.app/commandes`

(Il te demandera d'envoyer le header `x-vapi-secret` — pour un usage simple,
tu peux utiliser une extension navigateur comme "ModHeader", ou je peux te
créer une petite page web pour les consulter plus simplement.)

## Prochaines évolutions possibles

- Remplacer le fichier `orders.json` par une vraie base de données (utile
  si plusieurs commerces utilisent le même serveur)
- Ajouter l'envoi automatique d'un SMS/email au commerçant à chaque commande
- Créer une page web simple pour consulter les commandes sans passer par l'URL brute
