using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Data;
using TicketSystem.API.Domain.Exceptions;
using TicketSystem.API.Dtos;
using System.Security.Claims;
using TicketSystem.API.Enums;
using TicketSystem.API.Models;
using TicketSystem.API.Services;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/software-tickets")]
    public class SoftwareTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ExternalAuthService _externalAuth;

        public SoftwareTicketsController(AppDbContext context, ExternalAuthService externalAuth)
        {
            _context = context;
            _externalAuth = externalAuth;
        }

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private string CurrentUserName =>
            User.FindFirstValue(ClaimTypes.Name) ?? "Usuário Desconhecido";

        private bool IsInRole(string role) => User.IsInRole(role);

        private bool IsMaster => IsInRole(UserRoles.Admin);

        private bool IsOpener =>
            IsMaster ||
            IsInRole(UserRoles.Operator) ||
            IsInRole(UserRoles.Requester) ||
            IsInRole(UserRoles.InventoryClerk) ||
            IsInRole(UserRoles.TeamLead) ||
            IsInRole(UserRoles.QualityChecker) ||
            IsInRole(UserRoles.BackOfficeClerk) ||
            IsInRole(UserRoles.Specialist) ||
            IsInRole(UserRoles.TestSpecialist) ||
            IsInRole(UserRoles.ProductSpecialist) ||
            IsInRole(UserRoles.ProcessSpecialist) ||
            IsInRole(UserRoles.SoftwareSpecialist);

        private bool IsSoftwareAssumer =>
            IsMaster ||
            IsInRole(UserRoles.SoftwareAgent) ||
            IsInRole(UserRoles.SoftwareSpecialist);

        [HttpPost("open")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Operator},{UserRoles.Requester}," +
                   $"{UserRoles.InventoryClerk},{UserRoles.TeamLead},{UserRoles.QualityChecker}," +
                   $"{UserRoles.BackOfficeClerk},{UserRoles.Specialist}," +
                   $"{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist},{UserRoles.ProcessSpecialist}," +
                   $"{UserRoles.SoftwareSpecialist},{UserRoles.SoftwareAgent}," +
                   $"{UserRoles.SetupAgent},{UserRoles.TestAgent}," +
                   $"{UserRoles.AutomationAgent}")]
        public async Task<IActionResult> OpenTicket([FromBody] CreateSoftwareTicketDto request)
        {
            if (CurrentUserId == 0) return Unauthorized();

            ProductionLine? productionLine = null;

            if (request.ProductionLineId.HasValue && request.ProductionLineId.Value > 0)
            {
                productionLine = await _context.ProductionLines
                    .AsNoTracking()
                    .FirstOrDefaultAsync(pl => pl.Id == request.ProductionLineId.Value);

                if (productionLine == null)
                    return BadRequest("A linha de produção selecionada não existe.");
            }

            try
            {
                var ticket = SoftwareTickets.Create((int)CurrentUserId, CurrentUserName, request, productionLine);

                _context.SoftwareTickets.Add(ticket);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, new
                {
                    ticket.Id,
                    ticket.ConfirmationToken
                });
            }
            catch (DomainException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/start")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.SoftwareAgent},{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> StartTicket(int id, [FromBody] TicketsHandshakeDto request)
        {
            if (!IsSoftwareAssumer)
                return Forbid();

            var ticket = await _context.SoftwareTickets.FindAsync(id);
            if (ticket is null)
                return NotFound("Ticket não encontrado.");

            if (string.IsNullOrWhiteSpace(request.Token))
                return BadRequest("O token é obrigatório para assumir o ticket.");

            try
            {
                var resolverDept = User.FindFirstValue("department")
                                     ?? User.FindFirstValue(ClaimTypes.GroupSid)
                                     ?? string.Empty;

                ticket.Start((int)CurrentUserId, request.ResolverName, request.Token!);

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (DomainException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/resolve")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.SoftwareAgent},{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> ResolveTicket(int id, [FromBody] TicketsHandshakeDto request)
        {
            if (!IsSoftwareAssumer)
                return Forbid();

            var ticket = await _context.SoftwareTickets.FindAsync(id);
            if (ticket is null) return NotFound("Ticket não encontrado.");

            if (ticket.ResolverId != request.ResolverId && !IsMaster)
                return Unauthorized("Apenas o responsável responsável pode finalizar este ticket.");

            try
            {
                ticket.Resolve();
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (DomainException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _context.SoftwareTickets
                .AsNoTracking()
                .Include(t => t.ProductionLine)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket is null) return NotFound();

            if (!IsMaster && !IsSoftwareAssumer && ticket.RequesterId != CurrentUserId)
                return Forbid();

            return Ok(MapToResponse(ticket, CurrentUserId, IsMaster, IsSoftwareAssumer));
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            bool isOpenerOnly = IsOpener && !IsSoftwareAssumer;

            IQueryable<SoftwareTickets> query = _context.SoftwareTickets
                .AsNoTracking()
                .Include(t => t.ProductionLine)
                .Where(t => t.TargetDepartment == "engenharia de software");

            if (isOpenerOnly)
                query = query.Where(t => t.RequesterId == CurrentUserId);

            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var response = tickets.Select(t => MapToResponse(t, CurrentUserId, IsMaster, IsSoftwareAssumer));

            return Ok(response);
        }

        [HttpGet("debug-claims")]
        [Authorize]
        public IActionResult DebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value });
            return Ok(claims);
        }

        private static SoftwareTicketResponseDto MapToResponse(SoftwareTickets t, long currentUserId, bool isMaster, bool isSoftwareAssumer)
        {
            string locationDisplay = t.ProductionLine != null
                ? t.ProductionLine.LineName
                : t.PostLocation ?? "N/A";

            return new SoftwareTicketResponseDto
            {
                Id = t.Id,
                RequesterId = t.RequesterId,
                RequesterName = t.RequesterName,
                Status = t.Status,
                Sector = t.Sector.ToString(),
                Problem = t.Problem.ToString(),
                PostLocation = locationDisplay,
                ProductionLineId = t.ProductionLineId,
                NecessaryInfo = t.NecessaryInfo,
                IsLineStopped = t.IsLineStopped,
                LineStoppedTime = t.LineStoppedTime,
                ConfirmationToken = (t.RequesterId == currentUserId || isMaster ||
                                    (isSoftwareAssumer && t.Status == TicketStatus.Open))
                                    ? t.ConfirmationToken
                                    : null,
                CreatedAt = t.CreatedAt,
                StartedAt = t.StartedAt,
                FinishedAt = t.FinishedAt,
                ResolverId = t.ResolverId,
                ResolverName = t.ResolverName
            };
        }
    }
}