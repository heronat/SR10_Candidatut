DROP TABLE IF EXISTS `AttacheCandidature`;
DROP TABLE IF EXISTS `Fichier`;
DROP TABLE IF EXISTS `Candidature`;
DROP TABLE IF EXISTS `Offre`;
DROP TABLE IF EXISTS `Fiche_de_Poste`;
DROP TABLE IF EXISTS `Demande_Recruteur`;
DROP TABLE IF EXISTS `Rejoindre_Organisation`;
DROP TABLE IF EXISTS `Utilisateur`;
DROP TABLE IF EXISTS `Organisation`;




CREATE TABLE `Organisation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `date_creation` date NOT NULL,
  `etat` ENUM('en_attente', 'actif', 'refuse') NOT NULL DEFAULT 'en_attente',
  `type`varchar(50) NOT NULL,
  `longitude` float NOT NULL,
  `latitude` float NOT NULL,
  PRIMARY KEY (`id`)
) ;

CREATE TABLE `Utilisateur` (
  `mail` varchar(50) NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `nom` varchar(20) NOT NULL,
  `prenom` varchar(20) NOT NULL,
  `telephone` varchar(10) NOT NULL,
  `date_creation` date NOT NULL DEFAULT current_timestamp(),
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `type` ENUM('candidat', 'recruteur', 'administrateur') NOT NULL DEFAULT 'candidat',
  `longitude` float NOT NULL,
  `latitude` float NOT NULL,
  `organisation` int(11) DEFAULT NULL,
  CONSTRAINT `Utilisateur_ibfk_1` FOREIGN KEY (`organisation`) REFERENCES `Organisation` (`id`) On DELETE SET NULL,
  PRIMARY KEY (`mail`)
) ;

CREATE TABLE `Rejoindre_Organisation` (
  `mail` varchar(50) NOT NULL,
  `organisation` int(11) NOT NULL,
  PRIMARY KEY (`mail`),
  CONSTRAINT `Rejoindre_Organisation_ibfk_1` FOREIGN KEY (`mail`) REFERENCES `Utilisateur` (`mail`) ON DELETE CASCADE,
  CONSTRAINT `Rejoindre_Organisation_ibfk_2` FOREIGN KEY (`organisation`) REFERENCES `Organisation` (`id`) ON DELETE CASCADE
);

CREATE TABLE `Demande_Recruteur` (
  `mail` varchar(50) NOT NULL,
  PRIMARY KEY (`mail`),
  CONSTRAINT `Demande_Recruteur_ibfk_1` FOREIGN KEY (`mail`) REFERENCES `Utilisateur` (`mail`) ON DELETE CASCADE,
);

CREATE TABLE `Fiche_de_Poste`(
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `intitule` varchar(50) NOT NULL,
  `statut` varchar(50) NOT NULL,
  `responsable` varchar(50) NOT NULL,
  `type_metier` varchar(50) NOT NULL,
  `lieu` varchar(50) NOT NULL,
  `heures_semaine` int NOT NULL,
  `teletravail` tinyint(1) NOT NULL,
	`salaire_min` varchar(50) NOT NULL,
  `salaire_max` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `organisation` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `Fiche_de_Poste_ibfk_1` FOREIGN KEY (`organisation`) REFERENCES `Organisation` (`id`) ON DELETE CASCADE
) ;


CREATE TABLE `Offre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  `date_creation` date NOT NULL DEFAULT current_timestamp(),
  `date_de_validite` date NOT NULL,
  `description` text NOT NULL,
  `organisation` int(11) NOT NULL,
  `nombre_pieces_demandees` int NOT NULL,
  `pieces_demandees` text NOT NULL,
  `etat` ENUM('non_publiee', 'publiee', 'expiree') NOT NULL DEFAULT 'publiee',
  `fiche_de_poste` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organisation` (`organisation`),
  CONSTRAINT `Offre_ibfk_1` FOREIGN KEY (`organisation`) REFERENCES `Organisation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Offre_ibfk_2` FOREIGN KEY (`fiche_de_poste`) REFERENCES `Fiche_de_Poste` (`id`) ON DELETE CASCADE
) ;




CREATE TABLE `Candidature` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_creation` date NOT NULL DEFAULT current_timestamp(),
  `candidat` varchar(50) NOT NULL,
  `offre` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `candidat` (`candidat`),
  KEY `offre` (`offre`),
  CONSTRAINT `Candidature_ibfk_1` FOREIGN KEY (`candidat`) REFERENCES `Utilisateur` (`mail`) ON DELETE CASCADE,
  CONSTRAINT `Candidature_ibfk_2` FOREIGN KEY (`offre`) REFERENCES `Offre` (`id`) ON DELETE CASCADE
) ;


CREATE TABLE `Fichier` (
    `urn` varchar(100) NOT NULL,
    `auteur` varchar(50) NOT NULL,
    PRIMARY KEY (`urn`),
    KEY `auteur` (`auteur`),
    CONSTRAINT `Fichier_ibfk_1` FOREIGN KEY (`auteur`) REFERENCES `Utilisateur` (`mail`) ON DELETE CASCADE
);

CREATE TABLE `AttacheCandidature` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `candidature` int(11) NOT NULL,
    `fichier` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `candidature` (`candidature`),
    KEY `fichier` (`fichier`),
    CONSTRAINT `AttacheCandidature_ibfk_1` FOREIGN KEY (`candidature`) REFERENCES `Candidature` (`id`) ON DELETE CASCADE,
    CONSTRAINT `AttacheCandidature_ibfk_2` FOREIGN KEY (`fichier`) REFERENCES `Fichier` (`urn`) ON DELETE CASCADE
);



INSERT INTO `Organisation` (`nom`, `date_creation`, `etat`, `longitude`, `latitude`, `type`) VALUES
('UTC', '1972-05-09', 'actif', 2.4, 48.2, 'SARL'),
('Google', '2012-04-23', 'actif', 3, 55, 'SASU'),
('Poudlard', '2000-03-04', 'actif', 50, 3.5, 'SARL'),
('UTBM', '1998-05-06', 'actif', 37.2, 31.5, 'SASU');

/*
INSERT INTO `Utilisateur` (`mail`, `mdp`, `nom`, `prenom`, `telephone`, `date_creation`, `actif`, `type`, `longitude`, `latitude`, `organisation`) VALUES
('dark.vador@gmail.com', 'JeSuisTonPere', 'Vador', 'Dark', '0606060606', '2019-01-01', 1, 'administrateur', 0, 0, NULL),
('gandalf.leblanc@terredumilieu.com', 'ElfeDeMinuit', 'Leblanc', 'Gandalf', '0606060609', '2000-03-04', 1, 'recruteur', 89.3, -65, NULL),
('philippe.lefebvre@etu.utc.fr', 'tarte1235', 'LEFEBVRE', 'Philippe', '0652397215', '2023-04-12', 1, 'recruteur', 49.3, -49.3, 1),
('iron.man@avengers.com', 'Jarvis', 'Stark', 'Tony', '0606060608', '1972-02-07', 1, 'candidat', 3, 48, NULL),
('steve.minecraft@mojang.com', 'Minecraft', 'Minecraft', 'Steve', '0606060607', '2011-05-09', 1, 'candidat', 55.7, -6, NULL);


INSERT INTO `Rejoindre_Organisation` (`mail`, `organisation`) VALUES
('gandalf.leblanc@terredumilieu.com', 1);
*/
INSERT INTO `Fiche_de_Poste` (`intitule`, `statut`, `responsable`, `type_metier`, `lieu`, `heures_semaine`, `teletravail`, `salaire_min`, `salaire_max`, `description`, `organisation`) VALUES
('Développeur SQL', 'CDI', 'Michel Polnareff', 'Informatique', 'Compiègne', 35, 0, '30000', '40000', 'Développeur Base de Données', 1),
('Développeur Java', 'CDI', 'Elon Musk', 'Informatique', 'Mountain View', 35, 0, '35000', '45000', 'Développeur Java Logiciel', 2),
('Professeur de Potions', 'CDI', 'Claire Rossi', 'Enseignement', 'Ecosse', 35, 0, '25000', '50000', 'Professeur de Potions pour débutants', 3);

INSERT INTO `Offre` (`nom`, `date_de_validite`, `date_creation`, `description`, `organisation`, `nombre_pieces_demandees`,`pieces_demandees`, `fiche_de_poste` ) VALUES
('Développeur SQL', '2023-05-20','2022-05-06', 'Développeur Base de Données', 1, 2, 'CV, Lettre de motivation', 1),
('Développeur Java', '2024-05-07', '2019-03-06', 'Développeur Java', 2, 1, 'CV', 2),
('Professeur de Potions', '2025-05-08', '2020-04-02', 'Professeur de Potions', 3, 3, 'CV, Lettre de motivation, Diplôme', 3);
/*
INSERT INTO `Candidature` (`candidat`, `offre`) VALUES
( 'iron.man@avengers.com', 1),
( 'steve.minecraft@mojang.com', 2);

INSERT INTO `Fichier` (`urn`, `auteur`) VALUES
('urn:uuid:1', 'iron.man@avengers.com'),
('urn:uuid:2', 'steve.minecraft@mojang.com');

INSERT INTO `AttacheCandidature` (`candidature`, `fichier`) VALUES
(1, 'urn:uuid:1'),
(2, 'urn:uuid:2');
*/
