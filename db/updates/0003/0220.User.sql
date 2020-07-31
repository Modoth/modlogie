CREATE TABLE `User` (
  `Id` varchar(255) PRIMARY KEY,
  `Created` datetime(6) NOT NULL,
  `AuthorisionExpired` datetime(6) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Authorised` bit(1) DEFAULT 0,
  `Status` bit(1) DEFAULT 0,
  `Comment` varchar(255) DEFAULT NULL,
  UNIQUE KEY `IX_User_Email` (`Email`),
  KEY `IX_User_AuthorisionExpired` (`AuthorisionExpired`),
  KEY `IX_User_Authorised` (`Authorised`),
  KEY `IX_User_Status` (`Status`)
);