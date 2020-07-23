using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Modlogie.Domain.Models;

namespace Modlogie.Infrastructure.Data
{
    public partial class ModlogieContext : DbContext
    {
        public ModlogieContext()
        {
        }

        public ModlogieContext(DbContextOptions<ModlogieContext> options)
            : base(options)
        {
        }

        public virtual DbSet<DbVersion> DbVersions { get; set; }
        public virtual DbSet<File> Files { get; set; }
        public virtual DbSet<FileTag> FileTags { get; set; }
        public virtual DbSet<KeyValue> KeyValues { get; set; }
        public virtual DbSet<Tag> Tags { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseMySql("server=db;database=modlogie;user=root;password=123456", x => x.ServerVersion("10.5.4-mariadb"));
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DbVersion>(entity =>
            {
                entity.ToTable("DbVersion");

                entity.Property(e => e.Id).HasColumnType("int(11)");
            });

            modelBuilder.Entity<File>(entity =>
            {
                entity.ToTable("File");

                entity.HasIndex(e => e.MainTag);

                entity.HasIndex(e => e.Modified);

                entity.HasIndex(e => e.Name);

                entity.HasIndex(e => e.ParentId);

                entity.HasIndex(e => e.Path)
                    .IsUnique();

                entity.HasIndex(e => e.Shared);

                entity.HasIndex(e => e.Type);

                entity.Property(e => e.Id)
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.Content)
                    .HasColumnType("varchar(255)")
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.MainTag)
                    .HasColumnType("varchar(255)")
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnType("varchar(255)")
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.NormalFilesCount)
                    .HasColumnType("int(11)")
                    .HasDefaultValueSql("'0'");

                entity.Property(e => e.ParentId)
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.Path)
                    .IsRequired()
                    .HasColumnType("varchar(255)")
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.Shared)
                    .HasColumnType("bit(1)")
                    .HasDefaultValueSql("b'0'");

                entity.Property(e => e.Type)
                    .HasColumnType("int(11)")
                    .HasDefaultValueSql("'0'");

                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.InverseParent)
                    .HasForeignKey(d => d.ParentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<FileTag>(entity =>
            {
                entity.HasKey(e => new { e.FileId, e.TagId })
                    .HasName("PRIMARY");

                entity.ToTable("FileTag");

                entity.HasIndex(e => e.TagId);

                entity.Property(e => e.FileId)
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.TagId)
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.Value)
                    .HasColumnType("longtext")
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.HasOne(d => d.File)
                    .WithMany(p => p.FileTags)
                    .HasForeignKey(d => d.FileId);

                entity.HasOne(d => d.Tag)
                    .WithMany(p => p.FileTags)
                    .HasForeignKey(d => d.TagId);
            });

            modelBuilder.Entity<KeyValue>(entity =>
            {
                entity.ToTable("KeyValue");

                entity.Property(e => e.Id)
                    .HasColumnType("varchar(128)")
                    .HasCharSet("utf8")
                    .HasCollation("utf8_general_ci");

                entity.Property(e => e.Value)
                    .HasColumnType("varchar(128)")
                    .HasCharSet("utf8")
                    .HasCollation("utf8_general_ci");
            });

            modelBuilder.Entity<Tag>(entity =>
            {
                entity.ToTable("Tag");

                entity.HasIndex(e => e.Name)
                    .IsUnique();

                entity.Property(e => e.Id)
                    .HasCharSet("utf8mb4")
                    .HasCollation("utf8mb4_unicode_ci");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasColumnType("varchar(16)")
                    .HasCharSet("utf8")
                    .HasCollation("utf8_general_ci");

                entity.Property(e => e.Type).HasColumnType("int(11)");

                entity.Property(e => e.Values)
                    .HasColumnType("varchar(128)")
                    .HasCharSet("utf8")
                    .HasCollation("utf8_general_ci");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
