using TicketSystem.API.Enums;
using TicketSystem.API.Models;

namespace TicketSystem.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedUsersAsync(AppDbContext context, ILogger logger)
        {
            if (context.Users.Any())
            {
                logger.LogInformation("✔ Usuários já existem. Seeder ignorado.");
                return;
            }

            var users = new List<Users>
            {
                new Users
                {
                    Username = "admin",
                    FullName = "Admin Admin do Sistema",
                    Email = "admin@empresa.com.br",
                    Registration = "999999",
                    Role = UserRoles.Admin,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("master123"),
                    ResolverDepartment = Department.Engineering
                },

                new Users
                {
                    Username = "setup-agent",
                    FullName = "Responsável de Setup",
                    Email = "setup-agent@empresa.com.br",
                    Registration = "5555",
                    Role = UserRoles.SetupAgent,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("tech123"),
                    ResolverDepartment = Department.Setup
                },

                new Users
                {
                    Username = "automation-agent",
                    FullName = "Responsável de Automação",
                    Email = "automation-agent@empresa.com.br",
                    Registration = "6666",
                    Role = UserRoles.AutomationAgent,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("tech123"),
                    ResolverDepartment = Department.Automation
                },

                new Users
                {
                    Username = "test-agent",
                    FullName = "Responsável de Teste",
                    Email = "test-agent@empresa.com.br",
                    Registration = "7777",
                    Role = UserRoles.TestAgent,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("tech123"),
                    ResolverDepartment = Department.Test
                },

                new Users
                {
                    Username = "requester",
                    FullName = "Requester de Linha",
                    Email = "requester.linha@empresa.com.br",
                    Registration = "1234",
                    Role = UserRoles.Requester,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("monitor123"),
                    ResolverDepartment = Department.Production
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();

            logger.LogInformation($"✅ Seeder executado. {users.Count} usuários criados.");
        }
    }
}
