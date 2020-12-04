CREATE TABLE `Content` (
  `Id` char(36) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Created` datetime(6) NOT NULL,
  `Updated` datetime(6) NOT NULL,
  `Group` varchar(255) DEFAULT NULL,
  `Url` varchar(255) NOT NULL,
  `Data` MEDIUMTEXT DEFAULT NULL,
  PRIMARY KEY (`Id`), 
  KEY `IX_Content_Created` (`Created`),
  KEY `IX_Content_Updated` (`Updated`),
  KEY `IX_Content_Group` (`Group`)
);

CREATE TABLE `ContentTemplate` (
  `Id` char(36) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Updated` datetime(6) NOT NULL,
  `Data` MEDIUMTEXT DEFAULT NULL,
  PRIMARY KEY (`Id`), 
  UNIQUE KEY `IX_ContentTemplate_Name` (`Name`),
  KEY `IX_ContentTemplate_Updated` (`Updated`)
);

CREATE TABLE `ContentCache` (
  `ContentId` char(36) NOT NULL,
  `TemplateId` char(36) NOT NULL,
  `Content` varchar(255) DEFAULT NULL,
  `Updated` datetime(6) NOT NULL,
  PRIMARY KEY (`ContentId`, `TemplateId`),
  KEY `IX_ContentCache_Updated` (`Updated`),
  CONSTRAINT `FK_ContentCache_Content_ContentId` FOREIGN KEY (`ContentId`) REFERENCES `Content` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ContentCache_ContentTemplate_TemplateId` FOREIGN KEY (`TemplateId`) REFERENCES `ContentTemplate` (`Id`) ON DELETE CASCADE
);