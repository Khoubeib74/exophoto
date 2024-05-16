const apiUrl = "http://localhost:3000/"; // URL de l'API pour interagir avec le serveur backend
let photos = []; // Tableau pour stocker les photos récupérées du serveur
let selectedFiles = []; // Tableau pour stocker les fichiers sélectionnés par l'utilisateur

$(document).ready(function () {
  // Gérer le changement de l'entrée de fichier
  $("#fileInput").on("change", function (event) {
    selectedFiles = event.target.files; // Mettre à jour les fichiers sélectionnés
    const fileName =
      selectedFiles.length > 0
        ? `${selectedFiles.length} fichiers sélectionnés` // Si des fichiers sont sélectionnés, afficher le nombre de fichiers sélectionnés
        : "Aucun fichier sélectionné"; // Si aucun fichier n'est sélectionné, afficher ce message
    $("#fileName").text(fileName); // Mettre à jour le texte de l'élément affichant le nom du fichier
  });

  // Télécharger les photos
  $("#uploadBtn").on("click", function () {
    const description = $("#photoDescription").val(); // Récupérer la description saisie par l'utilisateur
    if (selectedFiles.length > 0 && description) {
      const formData = new FormData(); // Créer un nouvel objet FormData pour envoyer les fichiers et la description
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("photos", selectedFiles[i]); // Ajouter chaque fichier à l'objet FormData
      }
      formData.append("description", description); // Ajouter la description à l'objet FormData
      $.ajax({
        url: apiUrl + "photos", // URL de l'API pour télécharger les photos
        type: "POST", // Type de requête HTTP
        data: formData, // Données à envoyer
        processData: false, // Ne pas traiter les données
        contentType: false, // Ne pas définir de type de contenu
        success: function () {
          $("#photoDescription").val(""); // Effacer la description
          fetchPhotos(); // Recharger les photos
        },
        error: function (error) {
          console.error("Erreur lors du téléchargement des photos:", error); // Afficher une erreur en cas d'échec
        },
      });
    } else {
      alert("Veuillez sélectionner un fichier et entrer une description."); // Alerter l'utilisateur si des fichiers ou la description sont manquants
    }
  });

  // Rechercher des photos par description
  $("#searchInput").on("input", function () {
    const query = $(this).val().toLowerCase(); // Récupérer la valeur de recherche et la convertir en minuscule
    const filteredPhotos = photos.filter(
      (photo) => photo.description.toLowerCase().includes(query) // Filtrer les photos dont la description contient la valeur de recherche
    );
    displayPhotos(filteredPhotos); // Afficher les photos filtrées
  });

  // Récupérer et afficher les photos au chargement de la page
  fetchPhotos(); // Appeler la fonction pour récupérer et afficher les photos
});

function fetchPhotos() {
  $.get(apiUrl + "photos", function (data) {
    photos = data; // Mettre à jour le tableau des photos avec les données récupérées
    displayPhotos(photos); // Afficher les photos
  }).fail(function (error) {
    console.error("Erreur lors de la récupération des photos:", error); // Afficher une erreur en cas d'échec
  });
}

function displayPhotos(photosToDisplay) {
  const photoGrid = $("#photoGrid"); // Sélectionner l'élément du DOM où les photos seront affichées
  photoGrid.children(":not(#addPhoto)").remove(); // Supprimer tous les enfants sauf le bouton d'ajout de photo
  photosToDisplay.forEach((photo) => {
    const photoCard = `
        <div class="column is-full-mobile is-one-third-tablet is-one-quarter-desktop">
            <div class="card photo-card">
                <div class="card-image">
                    <figure class="image">
                        <a data-fancybox="gallery" href="${photo.url}">
                            <img src="${photo.url}" alt="Photo">
                        </a>
                    </figure>
                    <div class="content photo-details">
                        <button class="button is-danger" onclick="deletePhoto(${photo.id})">Supprimer</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="media">
                        <div class="media-content">
                            <p class="title is-4 editable-description" data-photo-id="${photo.id}">${photo.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    photoGrid.append(photoCard); // Ajouter la carte photo à l'élément du DOM
  });

  // Activer les descriptions éditables
  $(".editable-description").on("click", function () {
    const photoId = $(this).data("photo-id"); // Récupérer l'ID de la photo
    const currentDescription = $(this).text(); // Récupérer la description actuelle
    const newDescription = prompt(
      "Modifier la description:",
      currentDescription
    ); // Demander une nouvelle description à l'utilisateur
    if (newDescription && newDescription !== currentDescription) {
      updatePhotoDescription(photoId, newDescription); // Mettre à jour la description si elle a été modifiée
    }
  });
}

function deletePhoto(photoId) {
  $.ajax({
    url: apiUrl + `photos/${photoId}`, // URL de l'API pour supprimer la photo
    type: "DELETE", // Type de requête HTTP
    success: function () {
      fetchPhotos(); // Recharger les photos après suppression
    },
    error: function (error) {
      console.error("Erreur lors de la suppression de la photo:", error); // Afficher une erreur en cas d'échec
    },
  });
}

function updatePhotoDescription(photoId, newDescription) {
  $.ajax({
    url: apiUrl + `photos/${photoId}`, // URL de l'API pour mettre à jour la description
    type: "PUT", // Type de requête HTTP
    contentType: "application/json", // Type de contenu
    data: JSON.stringify({ description: newDescription }), // Données à envoyer
    success: function () {
      fetchPhotos(); // Recharger les photos après mise à jour
    },
    error: function (error) {
      console.error("Erreur lors de la mise à jour de la description:", error); // Afficher une erreur en cas d'échec
    },
  });
}
