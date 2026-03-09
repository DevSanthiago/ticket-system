using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Data;
using TicketSystem.API.Dtos;
using TicketSystem.API.Enums;
using TicketSystem.API.Models;
using System.Security.Claims;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/admin-cockpit")]
    [Authorize(Roles = UserRoles.Admin)]
    public class AdminCockpitController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminCockpitController(AppDbContext context)
        {
            _context = context;
        }

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        #region Production Lines Management

        [HttpGet("production-lines")]
        public async Task<IActionResult> GetAllProductionLines([FromQuery] bool includeInactive = false)
        {
            var query = _context.ProductionLines
                .AsNoTracking()
                .AsQueryable();

            if (!includeInactive)
                query = query.Where(pl => pl.IsActive);

            var lines = await query
                .OrderBy(pl => pl.Prefix)
                .ThenBy(pl => pl.LineName)
                .ToListAsync();

            var response = lines.Select(MapToProductionLineResponse).ToList();

            return Ok(response);
        }

        [HttpGet("production-lines/by-prefix")]
        public async Task<IActionResult> GetProductionLinesByPrefix([FromQuery] bool includeInactive = false)
        {
            var query = _context.ProductionLines
                .AsNoTracking()
                .AsQueryable();

            if (!includeInactive)
                query = query.Where(pl => pl.IsActive);

            var lines = await query
                .OrderBy(pl => pl.Prefix)
                .ThenBy(pl => pl.LineName)
                .ToListAsync();

            var prefixesFromDb = await _context.LinePrefixes.AsNoTracking().ToListAsync();

            var groupedLines = lines
                .GroupBy(l => l.Prefix)
                .Select(g => new ProductionLinesByPrefixDto
                {
                    Prefix = g.Key,
                    PrefixLabel = prefixesFromDb.FirstOrDefault(p => p.Value == g.Key)?.Label ?? g.Key,
                    Lines = [.. g.Select(MapToProductionLineResponse)]
                })
                .OrderBy(g => g.Prefix)
                .ToList();

            return Ok(groupedLines);
        }

        [HttpGet("production-lines/{id}")]
        public async Task<IActionResult> GetProductionLineById(int id)
        {
            var line = await _context.ProductionLines
                .AsNoTracking()
                .FirstOrDefaultAsync(pl => pl.Id == id);

            if (line is null)
                return NotFound(new { message = "Linha de produção não encontrada." });

            return Ok(MapToProductionLineResponse(line));
        }

        [HttpPost("production-lines")]
        public async Task<IActionResult> CreateProductionLine(CreateProductionLineDto dto)
        {
            if (CurrentUserId == 0)
                return Unauthorized();

            var existingLine = await _context.ProductionLines
                .FirstOrDefaultAsync(pl => pl.LineName == dto.LineName.Trim().ToUpper());

            if (existingLine is not null)
                return BadRequest(new { message = $"Já existe uma linha com o nome '{dto.LineName}'." });

            ProductionLine line;
            try
            {
                line = ProductionLine.Create(dto.LineName, dto.Prefix, dto.Description, (int)CurrentUserId);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            _context.ProductionLines.Add(line);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetProductionLineById),
                new { id = line.Id },
                MapToProductionLineResponse(line)
            );
        }

        [HttpPut("production-lines/{id}")]
        public async Task<IActionResult> UpdateProductionLine(int id, UpdateProductionLineDto dto)
        {
            if (CurrentUserId == 0)
                return Unauthorized();

            var line = await _context.ProductionLines.FindAsync(id);
            if (line is null)
                return NotFound(new { message = "Linha de produção não encontrada." });

            var existingLine = await _context.ProductionLines
                .FirstOrDefaultAsync(pl => pl.LineName == dto.LineName.Trim().ToUpper() && pl.Id != id);

            if (existingLine is not null)
                return BadRequest(new { message = $"Já existe outra linha com o nome '{dto.LineName}'." });

            try
            {
                line.Update(dto.LineName, dto.Prefix, dto.Description, (int)CurrentUserId);

                if (dto.IsActive != line.IsActive)
                {
                    if (dto.IsActive)
                        line.Activate((int)CurrentUserId);
                    else
                        line.Deactivate((int)CurrentUserId);
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            await _context.SaveChangesAsync();

            return Ok(MapToProductionLineResponse(line));
        }

        [HttpPost("production-lines/{id}/deactivate")]
        public async Task<IActionResult> DeactivateProductionLine(int id)
        {
            if (CurrentUserId == 0)
                return Unauthorized();

            var line = await _context.ProductionLines.FindAsync(id);
            if (line is null)
                return NotFound(new { message = "Linha de produção não encontrada." });

            line.Deactivate((int)CurrentUserId);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Linha de produção desativada com sucesso." });
        }

        [HttpPost("production-lines/{id}/activate")]
        public async Task<IActionResult> ActivateProductionLine(int id)
        {
            if (CurrentUserId == 0)
                return Unauthorized();

            var line = await _context.ProductionLines.FindAsync(id);
            if (line is null)
                return NotFound(new { message = "Linha de produção não encontrada." });

            line.Activate((int)CurrentUserId);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Linha de produção ativada com sucesso." });
        }

        [HttpDelete("production-lines/{id}")]
        public async Task<IActionResult> DeleteProductionLine(int id)
        {
            if (CurrentUserId == 0)
                return Unauthorized();

            var line = await _context.ProductionLines.FindAsync(id);
            if (line is null)
                return NotFound(new { message = "Linha de produção não encontrada." });

            var hasSetupTickets = await _context.SetupTickets.AnyAsync(t => t.ProductionLineId == id);
            var hasAutomationTickets = await _context.AutomationTickets.AnyAsync(t => t.ProductionLineId == id);
            var hasTestTickets = await _context.TestTickets.AnyAsync(t => t.ProductionLineId == id);

            if (hasSetupTickets || hasAutomationTickets || hasTestTickets)
                return BadRequest(new { message = "Não é possível excluir esta linha pois existem tickets associados a ela. Você pode desativá-la ao invés de excluir." });

            using var transaction = await _context.Database.BeginTransactionAsync();

            _context.ProductionLines.Remove(line);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { message = "Linha de produção excluída permanentemente com sucesso." });
        }

        [HttpGet("production-lines/prefixes")]
        public async Task<IActionResult> GetAvailablePrefixes()
        {
            var prefixes = await _context.LinePrefixes
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Label)
                .ToListAsync();

            return Ok(prefixes);
        }

        [HttpPost("production-lines/prefixes")]
        public async Task<IActionResult> CreatePrefix(CreateLinePrefixDto dto)
        {
            var existing = await _context.LinePrefixes
                .FirstOrDefaultAsync(p => p.Value == dto.Value.Trim().ToUpper());

            if (existing != null)
                return BadRequest(new { message = "Este prefixo já está cadastrado." });

            var prefix = new LinePrefix
            {
                Value = dto.Value.Trim().ToUpper(),
                Label = dto.Label.Trim(),
                IsActive = true
            };

            _context.LinePrefixes.Add(prefix);
            await _context.SaveChangesAsync();

            return Ok(prefix);
        }

        [HttpDelete("production-lines/prefixes/{id}")]
        public async Task<IActionResult> DeletePrefix(int id)
        {
            var prefix = await _context.LinePrefixes.FindAsync(id);
            if (prefix == null) return NotFound();

            var hasLines = await _context.ProductionLines.AnyAsync(l => l.Prefix == prefix.Value);
            if (hasLines)
                return BadRequest(new { message = "Não é possível excluir um prefixo que possui linhas associadas." });

            _context.LinePrefixes.Remove(prefix);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Prefixo removido com sucesso." });
        }

        #endregion

        #region Helper Methods

        private static ProductionLineResponseDto MapToProductionLineResponse(ProductionLine line)
        {
            return new ProductionLineResponseDto
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
            };
        }

        #endregion
    }
}