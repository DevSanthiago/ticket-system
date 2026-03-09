using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Data;
using TicketSystem.API.Domain.Exceptions;
using TicketSystem.API.Dtos;
using System.Security.Claims;
using TicketSystem.API.Enums;
using TicketSystem.API.Models;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/automation-tickets")]
    public class AutomationTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AutomationTicketsController(AppDbContext context)
        {
            _context = context;
        }

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private string CurrentUserName =>
            User.FindFirstValue(ClaimTypes.Name) ?? "Usuário Desconhecido";

        private bool IsInRole(string role) =>
            User.IsInRole(role);

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

        private bool IsAutomationAssumer =>
            IsMaster ||
            IsInRole(UserRoles.AutomationAgent) ||
            IsInRole(UserRoles.Specialist) ||
            IsInRole(UserRoles.TestSpecialist) ||
            IsInRole(UserRoles.ProductSpecialist) ||
            IsInRole(UserRoles.ProcessSpecialist) ||
            IsInRole(UserRoles.SoftwareSpecialist);

        [HttpPost("open")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Operator},{UserRoles.Requester}," +
                           $"{UserRoles.InventoryClerk},{UserRoles.TeamLead},{UserRoles.QualityChecker}," +
                           $"{UserRoles.BackOfficeClerk},{UserRoles.Specialist}," +
                           $"{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist},{UserRoles.ProcessSpecialist}," +
                           $"{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> OpenTicket([FromBody] CreateAutomationTicketsDto request)
        {
            if (CurrentUserId == 0) return Unauthorized();

            var productionLine = await _context.ProductionLines
                .AsNoTracking()
                .FirstOrDefaultAsync(pl => pl.Id == request.ProductionLineId);

            if (productionLine == null)
                return BadRequest("A linha de produção selecionada não existe.");

            try
            {
                var ticket = AutomationTickets.Create((int)CurrentUserId, CurrentUserName, productionLine, request);

                _context.AutomationTickets.Add(ticket);
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
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.AutomationAgent}," +
           $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
           $"{UserRoles.ProcessSpecialist},{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> StartTicket(int id, [FromBody] TicketsHandshakeDto request)
        {
            if (!IsAutomationAssumer)
                return Forbid();

            var ticket = await _context.AutomationTickets.FindAsync(id);
            if (ticket is null)
                return NotFound("Ticket não encontrado.");

            if (string.IsNullOrWhiteSpace(request.Token))
                return BadRequest("O token é obrigatório para assumir o ticket.");

            try
            {
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
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.AutomationAgent}," +
                           $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
                           $"{UserRoles.ProcessSpecialist},{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> ResolveTicket(int id, [FromBody] TicketsHandshakeDto request)
        {
            if (!IsAutomationAssumer)
                return Forbid();

            var ticket = await _context.AutomationTickets.FindAsync(id);
            if (ticket is null)
                return NotFound("Ticket não encontrado.");

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
            var ticket = await _context.AutomationTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket is null)
                return NotFound();

            if (!IsMaster && !IsAutomationAssumer && ticket.RequesterId != CurrentUserId)
                return Forbid();

            return Ok(MapToResponse(ticket));
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            bool isOpener = IsOpener && !IsAutomationAssumer;

            IQueryable<AutomationTickets> query = _context.AutomationTickets.AsNoTracking();

            if (isOpener)
                query = query.Where(t => t.RequesterId == CurrentUserId);

            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var response = tickets.Select(t => new AutomationTicketsResponseDto
            {
                Id = t.Id,
                RequesterId = t.RequesterId,
                RequesterName = t.RequesterName,
                TicketType = t.TicketType,
                Status = t.Status,

                ConfirmationToken = (t.RequesterId == CurrentUserId || IsMaster ||
                                    (IsAutomationAssumer && t.Status == TicketStatus.Open))
                                    ? t.ConfirmationToken
                                    : null,

                CreatedAt = t.CreatedAt,
                LineCategory = t.LineCategory.ToString(),
                IsLineStopped = t.IsLineStopped,
                LineStoppedTime = t.LineStoppedTime,
                LineName = t.LineName,
                Product = t.Product,
                RunningProduct = t.RunningProduct,
                Observation = t.Observation,
                LineSystem = t.LineSystem?.ToString(),
                SystemSupportType = t.SystemSupportType?.ToString(),
                ToolType = t.ToolType?.ToString(),
                LabelValidationType = t.LabelValidationType?.ToString(),
                ProductModel = t.ProductModel,
                ResolverId = t.ResolverId,
                ResolverName = t.ResolverName,
                ChecklistStatus = t.ChecklistStatus
            });

            return Ok(response);
        }

        private static AutomationTicketsResponseDto MapToResponse(AutomationTickets t)
        {
            return new AutomationTicketsResponseDto
            {
                Id = t.Id,
                RequesterId = t.RequesterId,
                RequesterName = t.RequesterName,
                TicketType = t.TicketType,
                Status = t.Status,
                ConfirmationToken = t.ConfirmationToken,
                CreatedAt = t.CreatedAt,
                LineCategory = t.LineCategory.ToString(),
                IsLineStopped = t.IsLineStopped,
                LineStoppedTime = t.LineStoppedTime,
                LineName = t.LineName,
                Product = t.Product,
                RunningProduct = t.RunningProduct,
                Observation = t.Observation,
                LineSystem = t.LineSystem?.ToString(),
                SystemSupportType = t.SystemSupportType?.ToString(),
                ToolType = t.ToolType?.ToString(),
                LabelValidationType = t.LabelValidationType?.ToString(),
                ProductModel = t.ProductModel,
                ResolverId = t.ResolverId,
                ResolverName = t.ResolverName,
                ChecklistStatus = t.ChecklistStatus
            };
        }
    }
}