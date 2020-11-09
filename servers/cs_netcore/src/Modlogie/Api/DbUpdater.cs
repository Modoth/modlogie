using System.Collections.Generic;
using System.Data.Common;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;

namespace Modlogie.Api
{
    public class DbUpdater
    {
        private const string VersionsTableName = "DbVersion";

        private const string CreatesPath = "creates";

        private const string UpdatesPath = "updates";

        private readonly string _dataSource;

        private readonly string _dataSourceNoDbName;

        private readonly string _dbName;

        private readonly ILogger _logger;

        private readonly string _scriptsPath;

        public DbUpdater(ILogger logger, string dataSource, string dbName, string dataSourceNoDbName,
            string scriptsPath)
        {
            _logger = logger;
            _dataSource = dataSource;
            _dbName = dbName;
            _dataSourceNoDbName = dataSourceNoDbName;
            _scriptsPath = scriptsPath;
        }

        public async Task UpdateAsync()
        {
            var newDb = false;
            await using (var conn = new MySqlConnection(_dataSourceNoDbName))
            {
                await conn.OpenAsync();
                if (!await DbExisted(conn))
                {
                    await CreateDb(conn);
                    newDb = true;
                }
            }

            await using (var conn = new MySqlConnection(_dataSource))
            {
                await conn.OpenAsync();
                if (newDb)
                {
                    await InitDb(conn);
                }
                else
                {
                    await UpdateDb(conn);
                }
            }
        }


        private async Task CreateDb(DbConnection conn)
        {
            _logger.LogInformation("Create database");
            var cmd = conn.CreateCommand();
            cmd.CommandText = $"CREATE DATABASE {_dbName} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci";
            await cmd.ExecuteNonQueryAsync();
        }

        private async Task InitDb(DbConnection conn)
        {
            var version = 0;
            var newVersions = GetLatestVersions(version);
            if (newVersions.Any())
            {
                version = int.Parse(newVersions.Last());
            }

            await using var trans = await conn.BeginTransactionAsync();
            await ExecuteSqlsInDir(conn, trans, Path.Combine(_scriptsPath, CreatesPath));
            var cmd = conn.CreateCommand();
            cmd.Transaction = trans;
            cmd.CommandText = $"INSERT INTO {VersionsTableName} VALUES ({version})";
            await cmd.ExecuteNonQueryAsync();
            await trans.CommitAsync();
        }

        private async Task UpdateDb(DbConnection conn)
        {
            var currentVersion = await GetDbVersion(conn);
            var newVersions = GetLatestVersions(currentVersion);
            if (newVersions.Any())
            {
                await using var trans = await conn.BeginTransactionAsync();
                foreach (var v in newVersions)
                {
                    _logger.LogInformation($"Update database to version {v}");
                    await ExecuteSqlsInDir(conn, trans, Path.Combine(_scriptsPath, UpdatesPath, v));
                }

                var newVersion = int.Parse(newVersions.Last());
                var cmd = conn.CreateCommand();
                cmd.Transaction = trans;
                cmd.CommandText = $"UPDATE {VersionsTableName} SET Id={newVersion.ToString()}";
                await cmd.ExecuteNonQueryAsync();
                await trans.CommitAsync();
            }
        }

        private string[] GetLatestVersions(long currentVersion)
        {
            var updatesPath = Path.Combine(_scriptsPath, UpdatesPath);
            if (!Directory.Exists(updatesPath))
            {
                return new string[0];
            }

            var versions = new List<(string, long)>();
            var dirs = Directory.GetDirectories(updatesPath);
            foreach (var dir in dirs)
            {
                var dirName = Path.GetFileName(dir);
                if (long.TryParse(dirName, out var version) && version > currentVersion)
                {
                    versions.Add((dirName, version));
                }
            }

            return versions.OrderBy(t => t.Item2).Select(t => t.Item1).ToArray();
        }

        private async Task<int> GetDbVersion(DbConnection conn)
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = $"SELECT Id FROM {VersionsTableName}";
            return (int) await cmd.ExecuteScalarAsync();
        }

        private async Task<bool> DbExisted(DbConnection conn)
        {
            var cmd = conn.CreateCommand();
            cmd.CommandText = $"SELECT COUNT(*) FROM information_schema.schemata WHERE SCHEMA_NAME='{_dbName}'";
            var count = (long) await cmd.ExecuteScalarAsync();
            return count > 0;
        }

        private async Task ExecuteSqlsInDir(DbConnection conn, DbTransaction trans, string scriptsPath)
        {
            var scriptFiles = Directory.GetFiles(scriptsPath).OrderBy(s => s);
            foreach (var scriptFile in scriptFiles)
            {
                var script = await File.ReadAllTextAsync(scriptFile);
                var cmd = conn.CreateCommand();
                cmd.Transaction = trans;
                cmd.CommandText = script;
                await cmd.ExecuteNonQueryAsync();
            }
        }
    }
}