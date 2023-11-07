Projet 7
Mon Vieux Grimoire

Installation
Clonez le référentiel depuis GitHub sur votre machine locale.

git clone https://github.com/votre-utilisateur/votre-projet.git
Accédez au répertoire du projet.

cd votre-projet
cd frontend
npm install
npm run start

cd backend
npm install
npm install -g nodemon
nodemon server

Configuration
Créez un fichier .env à la racine du projet.

Ouvrez le fichier .env dans un éditeur de texte et ajoutez les informations de configuration suivantes :

# Configuration de la base de données MongoDB
DB_USERNAME=votre_nom_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_HOST=votre_nom_d_hote

Base de Données MongoDB
Accédez à votre compte MongoDB et créez une base de données.

Copiez le nom d'utilisateur, le mot de passe et le nom de l'hôte (généralement fourni par MongoDB) dans le fichier .env.

L'application sera disponible à l'adresse http://localhost:3000 dans votre navigateur.
