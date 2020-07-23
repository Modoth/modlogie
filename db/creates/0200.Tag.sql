CREATE TABLE `Tag` (
    `Id` char(36) PRIMARY KEY,
    `Name` NVARCHAR(16) NOT NULL,
    `Type` int(11) NOT NULL,
    `Values` NVARCHAR(128) DEFAULT NULL,
    UNIQUE KEY `IX_Tag_Name` (`Name`)
)