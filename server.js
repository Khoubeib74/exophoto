const express = require("express"); // Importe le module express pour créer le serveur web
const multer = require("multer"); // Importe le module multer pour gérer les téléchargements de fichiers
const cors = require("cors"); // Importe le module cors pour autoriser les requêtes cross-origin
const fs = require("fs"); // Importe le module fs pour manipuler les fichiers
const path = require("path"); // Importe le module path pour travailler avec les chemins de fichiers

const app = express(); // Crée une application express
const port = 3000; // Définit le port sur lequel le serveur va écouter
const upload = multer({ dest: "uploads/" }); // Configure multer pour stocker les fichiers dans le dossier "uploads"

app.use(cors()); // Utilise le middleware CORS pour permettre les requêtes cross-origin
app.use(express.json()); // Utilise le middleware JSON pour parser les requêtes au format JSON

let photos = []; // Initialise un tableau pour stocker les informations des photos

// Charge les photos existantes à partir d'un fichier (optionnel, pour la persistance des données)
if (fs.existsSync("photos.json")) {
  photos = JSON.parse(fs.readFileSync("photos.json")); // Lit le fichier et parse les données JSON
}

// Point de terminaison pour obtenir toutes les photos
app.get("/photos", (req, res) => {
  res.json(photos); // Renvoie le tableau des photos en réponse JSON
});

// Point de terminaison pour télécharger des photos
app.post("/photos", upload.array("photos"), (req, res) => {
  const { description } = req.body; // Récupère la description des photos depuis le corps de la requête
  const uploadedPhotos = req.files.map((file) => {
    const photo = {
      id: Date.now(), // Génère un ID unique pour chaque photo
      url: `http://localhost:${port}/uploads/${file.filename}`, // Génère l'URL de la photo téléchargée
      description: description || "No description", // Utilise la description fournie ou une description par défaut
    };
    photos.push(photo); // Ajoute la photo au tableau des photos
    return photo; // Retourne la photo
  });

  // Sauvegarde le tableau des photos dans un fichier (optionnel, pour la persistance des données)
  fs.writeFileSync("photos.json", JSON.stringify(photos));

  res.json({ success: true, photos: uploadedPhotos }); // Renvoie une réponse JSON avec les photos téléchargées
});

// Point de terminaison pour supprimer une photo
app.delete("/photos/:id", (req, res) => {
  const { id } = req.params; // Récupère l'ID de la photo depuis les paramètres de l'URL
  photos = photos.filter((photo) => photo.id !== parseInt(id)); // Filtre le tableau pour supprimer la photo avec l'ID correspondant

  // Sauvegarde le tableau des photos dans un fichier (optionnel, pour la persistance des données)
  fs.writeFileSync("photos.json", JSON.stringify(photos));

  res.json({ success: true, message: "Photo deleted successfully" }); // Renvoie une réponse JSON confirmant la suppression
});

// Point de terminaison pour mettre à jour la description d'une photo
app.put("/photos/:id", (req, res) => {
  const { id } = req.params; // Récupère l'ID de la photo depuis les paramètres de l'URL
  const { description } = req.body; // Récupère la nouvelle description depuis le corps de la requête
  const photo = photos.find((photo) => photo.id === parseInt(id)); // Trouve la photo avec l'ID correspondant

  if (photo) {
    photo.description = description; // Met à jour la description de la photo
    // Sauvegarde le tableau des photos dans un fichier (optionnel, pour la persistance des données)
    fs.writeFileSync("photos.json", JSON.stringify(photos));
    res.json({ success: true, photo }); // Renvoie une réponse JSON avec la photo mise à jour
  } else {
    res.status(404).json({ success: false, message: "Photo not found" }); // Renvoie une erreur 404 si la photo n'est pas trouvée
  }
});

// Servir les fichiers téléchargés
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Sert les fichiers du dossier "uploads" de manière statique

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Démarre le serveur et affiche un message dans la console
});
