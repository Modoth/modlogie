CREATE TABLE `File` (
  `Id` char(36) NOT NULL,
  `Created` datetime(6) NOT NULL,
  `Modified` datetime(6) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `ParentId` char(36) DEFAULT NULL,
  `Type` int(11) DEFAULT 0,
  `Path` varchar(255) NOT NULL,
  `Content` varchar(255) DEFAULT NULL,
  `NormalFilesCount` int DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_File_Path` (`Path`),
  KEY `IX_File_Modified` (`Modified`),
  KEY `IX_File_Name` (`Name`),
  KEY `IX_File_ParentId` (`ParentId`),
  KEY `IX_File_Type` (`Type`),
  CONSTRAINT `FK_File_File_ParentId` FOREIGN KEY (`ParentId`) REFERENCES `File` (`Id`) ON DELETE
  SET NULL
);
CREATE TABLE `FileTag` (
  `FileId` char(36) NOT NULL,
  `TagId` char(36) NOT NULL,
  `Value` longtext DEFAULT NULL,
  PRIMARY KEY (`FileId`, `TagId`),
  KEY `IX_FileTag_TagId` (`TagId`),
  CONSTRAINT `FK_FileTag_File_FileId` FOREIGN KEY (`FileId`) REFERENCES `File` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_FileTag_Tag_TagId` FOREIGN KEY (`TagId`) REFERENCES `Tag` (`Id`) ON DELETE CASCADE
);