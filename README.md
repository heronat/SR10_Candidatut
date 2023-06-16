# SR10_P2023_piteux_lefebvre


## Présentation du répertoire
Ce répertoire comprend tout le travail réalisé pour le projet de l'UV SR10, à savoir la réalisation s'un site web de recrutement. Ce projet a été réalisé par Philippe Lefebvre et Nathan Piteux au semestre P23 sous la supervision de M. Mohamed Akheraz.

## Structure du répertoire
Ce répertoire est divisé en 5 dossiers séparés :

### TD1_Conception
Ce dossier comprend tous les documents correspondant à l'architecture de notre projet, on y retrouve:
- UML classes.txt : code correspondant à un diagramme de classes représentant le MCD de notre projet, ce code permet de générer l'UML grâce à l'outil PlantUML
-  SR10_MCD.png : UML correspondant au MCD résultant du code du fichier UML classes.txt
- UML usecase.txt : code correspondant à un diagramme de cas d'utilisation représentant toutes les actions effectuables sur notre site, ce code permet de générer l'UML grâce à l'outil PlantUML
- SR10_UML_cas_utilisation.png : UML correspondant au diagramme de cas d'utilisation résultant du code du fichier UML usecase.txt
- MLD.txt : MLD créé à partir du MCD de notre projet et qui nous permet de faire la transition entre le MCD et le code SQL de création de la base de données
- SR10_wireframe.pptx : carte visuelle de notre site web


### TD2_static
Ce dossier comprend les codes de la version statique de notre projet. Ici, nous utilisons seulement les langages HTML et CSS donc le site n'interagit pas avec la base de données.

### candidatut
Ce dossier représente l'intégralité de notre site web utilisable. Il suit un modèle MVC, voici les dossiers qui le compose:
- model comprend tous les fichiers liés au modèle qui permettent de faire les requêtes avec la base de données
- dans public, on retrouve les feuilles de style CSS
- dans routes, on retrouve toutes les fonctions permettant de faire le lien entre les vues et le modèle et qui permet de diriger l'utilisateur en fonction des actions qu'il effectue sur le site
- test rassemble les fichiers permettant au programmeur de faire des tests sur son code grâce au module JEST
- views comprend tous les fichiers ejs permettant d'afficher le site à l'utilisateur
- app.js : fichier central qui fait le lien entre tous les autres fichiers, importe et configure les modules nécessaires
- bdd.sql : fichier de création de notre base de données et insertion de valeurs d'exemple

### candidatut fe
Dossier comprenant le test de l'utilisation de l'API REST et de VueJS

### node_modules
Liste de tous les modules nécessaires à l'exécution de notre site


