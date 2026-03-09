using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Models;

namespace TicketSystem.API.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<SetupTickets> SetupTickets { get; set; }
        public DbSet<AutomationTickets> AutomationTickets { get; set; }
        public DbSet<TestTickets> TestTickets { get; set; }
        public DbSet<SoftwareTickets> SoftwareTickets { get; set; }
        public DbSet<ProductionLine> ProductionLines { get; set; }
        public DbSet<LinePrefix> LinePrefixes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProductionLine>()
                .HasIndex(pl => pl.LineName)
                .IsUnique();

            modelBuilder.Entity<ProductionLine>()
                .HasIndex(pl => pl.Prefix);

            modelBuilder.Entity<ProductionLine>()
                .HasIndex(pl => pl.IsActive);

            modelBuilder.Entity<ProductionLine>()
                .Property(pl => pl.IsActive)
                .HasDefaultValue(true);

            modelBuilder.Entity<ProductionLine>()
                .Property(pl => pl.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
        }
    }
}