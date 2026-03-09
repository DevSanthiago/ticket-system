using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Data;
using TicketSystem.API.Dtos;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/production-lines")]
    [Authorize]
    public class ProductionLinesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductionLinesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("prefixes")]
        public async Task<IActionResult> GetActivePrefixes()
        {
            var prefixes = await _context.LinePrefixes
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Label)
                .ToListAsync();

            return Ok(prefixes);
        }

        [HttpGet("by-prefix")]
        public async Task<IActionResult> GetLinesByPrefix()
        {
            var lines = await _context.ProductionLines
                .AsNoTracking()
                .Where(pl => pl.IsActive)
                .OrderBy(pl => pl.Prefix)
                .ThenBy(pl => pl.LineName)
                .ToListAsync();

            var prefixes = await _context.LinePrefixes
                .AsNoTracking()
                .Where(p => p.IsActive)
                .ToListAsync();

            var groupedLines = lines
                .GroupBy(l => l.Prefix)
                .Select(g => new ProductionLinesByPrefixDto
                {
                    Prefix = g.Key,
                    PrefixLabel = prefixes.FirstOrDefault(p => p.Value == g.Key)?.Label ?? g.Key,
                    Lines = g.Select(line => new ProductionLineResponseDto
                    {
                        Id = line.Id,
                        LineName = line.LineName,
                        Prefix = line.Prefix,
                        Description = line.Description,
                        IsActive = line.IsActive,
                        CreatedAt = line.CreatedAt,
                        UpdatedAt = line.UpdatedAt,
                        CreatedByUserName = "Sistema",
                        UpdatedByUserName = null
                    }).ToList()
                })
                .OrderBy(g => g.Prefix)
                .ToList();

            return Ok(groupedLines);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllActiveLines()
        {
            var lines = await _context.ProductionLines
                .AsNoTracking()
                .Where(pl => pl.IsActive)
                .OrderBy(pl => pl.Prefix)
                .ThenBy(pl => pl.LineName)
                .ToListAsync();

            var response = lines.Select(line => new ProductionLineResponseDto
            {
                Id = line.Id,
                LineName = line.LineName,
                Prefix = line.Prefix,
                Description = line.Description,
                IsActive = line.IsActive,
                CreatedAt = line.CreatedAt,
                UpdatedAt = line.UpdatedAt,
                CreatedByUserName = "Sistema",
                UpdatedByUserName = null
            }).ToList();

            return Ok(response);
        }
    }
}