using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Models;

namespace TicketSystem.API.Data
{
    public static class ProductionLineSeeder
    {
        public static async Task SeedProductionLinesAsync(AppDbContext context, ILogger logger)
        {
            try
            {
                if (!await context.LinePrefixes.AnyAsync())
                {
                    logger.LogInformation("Populando tabela de prefixos inicial...");
                    var initialPrefixes = new List<LinePrefix>
                    {
                        new() { Value = "MB", Label = "Linhas MB" },
                        new() { Value = "ML", Label = "Linhas ML" },
                        new() { Value = "PC", Label = "Linhas PC" },
                        new() { Value = "LOGS", Label = "Linhas LOGS" },
                        new() { Value = "SA", Label = "Laboratório (SA)" },
                        new() { Value = "PD", Label = "Linhas PD" }
                    };
                    await context.LinePrefixes.AddRangeAsync(initialPrefixes);
                    await context.SaveChangesAsync();
                }

                if (await context.ProductionLines.AnyAsync())
                {
                    logger.LogInformation("Linhas de produção já existem no banco de dados.");
                    return;
                }

                const int SystemUserId = 1;

                logger.LogInformation("Iniciando seed de linhas de produção...");

                var productionLines = new List<ProductionLine>();

                for (int i = 1; i <= 11; i++)
                {
                    productionLines.Add(ProductionLine.Create($"MB{i:D2}", "MB", $"Linha de produção MB {i:D2}", SystemUserId));
                }

                for (int i = 1; i <= 4; i++)
                {
                    productionLines.Add(ProductionLine.Create($"ZB{i:D2}", "ML", $"Linha de produção ML {i:D2}", SystemUserId));
                }

                for (int i = 1; i <= 4; i++)
                {
                    productionLines.Add(ProductionLine.Create($"PC{i:D2}", "PC", $"Linha de produção PC {i:D2}", SystemUserId));
                }

                var logsLines = new List<(string name, string description)>
                {
                    ("LO01/LO1A", "Linha de produção LOGS LO01/LO1A"),
                    ("LO02/LO2A", "Linha de produção LOGS LO02/LO2A"),
                    ("LO03/LO3A", "Linha de produção LOGS LO03/LO3A"),
                    ("LO04/LO4A", "Linha de produção LOGS LO04/LO4A"),
                    ("LO05/LO5A", "Linha de produção LOGS LO05/LO5A"),
                    ("LO08/LO8A", "Linha de produção LOGS LO08/LO8A"),
                    ("LO09/LO10", "Linha de produção LOGS LO09/LO10"),
                    ("LOG10/G10", "Linha de produção LOGS LOG10/G10")
                };

                foreach (var line in logsLines)
                {
                    productionLines.Add(ProductionLine.Create(line.name, "LOGS", line.description, SystemUserId));
                }

                for (int i = 1; i <= 5; i++)
                {
                    productionLines.Add(ProductionLine.Create($"SA{i:D2}", "SA", $"Laboratório SA {i:D2}", SystemUserId));
                }

                for (int i = 1; i <= 3; i++)
                {
                    productionLines.Add(ProductionLine.Create($"PD{i:D2}", "PD", $"Linha de produção PD {i:D2}", SystemUserId));
                }

                await context.ProductionLines.AddRangeAsync(productionLines);
                await context.SaveChangesAsync();

                logger.LogInformation($"{productionLines.Count} linhas de produção foram criadas com sucesso!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao popular linhas de produção no banco de dados.");
                throw;
            }
        }
    }
}