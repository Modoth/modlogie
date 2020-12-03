CREATE TABLE `Content` (
  `Id` char(36) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Created` datetime(6) NOT NULL,
  `Group` varchar(255) DEFAULT NULL,
  `Url` varchar(255) NOT NULL,
  `Data` MEDIUMTEXT DEFAULT NULL,
  PRIMARY KEY (`Id`), 
  KEY `IX_File_Created` (`Created`),
  KEY `IX_File_Group` (`Group`)
);