CREATE TABLE KeyValue(
    `Id` NVARCHAR(128) PRIMARY KEY,
    `Type` int(11) DEFAULT 0,
    Value NVARCHAR(512),
    KEY `IX_KeyValue_Type` (`Type`)
);
