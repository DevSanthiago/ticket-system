using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Data;
using TicketSystem.API.Domain.Exceptions;
using System.Security.Claims;
using TicketSystem.API.Dtos;
using TicketSystem.API.Enums;
using TicketSystem.API.Models;
using TicketSystem.API.Services;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/test-tickets")]
    public class TestTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ExternalAuthService _externalAuth;

        public TestTicketsController(AppDbContext context, ExternalAuthService externalAuth)
        {
            _context = context;
            _externalAuth = externalAuth;
        }

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private string CurrentUserName =>
            User.FindFirstValue(ClaimTypes.Name) ?? "Usuário Desconhecido";

        private bool IsMaster => User.IsInRole(UserRoles.Admin);

        private bool IsOpener =>
            IsMaster ||
            User.IsInRole(UserRoles.Operator) ||
            User.IsInRole(UserRoles.Requester) ||
            User.IsInRole(UserRoles.InventoryClerk) ||
            User.IsInRole(UserRoles.TeamLead) ||
            User.IsInRole(UserRoles.QualityChecker) ||
            User.IsInRole(UserRoles.BackOfficeClerk) ||
            User.IsInRole(UserRoles.Specialist) ||
            User.IsInRole(UserRoles.TestSpecialist) ||
            User.IsInRole(UserRoles.ProductSpecialist) ||
            User.IsInRole(UserRoles.ProcessSpecialist) ||
            User.IsInRole(UserRoles.SoftwareSpecialist);

        private bool IsTestAssumer =>
            IsMaster ||
            User.IsInRole(UserRoles.TestAgent) ||
            User.IsInRole(UserRoles.TestSpecialist);

        [HttpPost("open")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Operator},{UserRoles.Requester}," +
                           $"{UserRoles.InventoryClerk},{UserRoles.TeamLead},{UserRoles.QualityChecker}," +
                           $"{UserRoles.BackOfficeClerk},{UserRoles.Specialist}," +
                           $"{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist},{UserRoles.ProcessSpecialist}," +
                           $"{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> OpenTicket(CreateTestTicketsDto request)
        {
            if (CurrentUserId == 0)
                return Unauthorized();

            var productionLine = await _context.ProductionLines
                .AsNoTracking()
                .FirstOrDefaultAsync(pl => pl.Id == request.ProductionLineId);

            if (productionLine == null)
                return BadRequest("Linha de produção não encontrada.");

            try
            {
                var ticket = TestTickets.Create((int)CurrentUserId, CurrentUserName, productionLine, request);
                _context.TestTickets.Add(ticket);
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
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.TestAgent},{UserRoles.TestSpecialist}")]
        public async Task<IActionResult> StartTicket(int id, TicketsHandshakeDto request)
        {
            if (!IsTestAssumer)
                return Forbid();

            var ticket = await _context.TestTickets.FindAsync(id);
            if (ticket is null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(request.Token))
                return BadRequest("O token é obrigatório para assumir o ticket.");

            try
            {
                ticket.Start((int)CurrentUserId, request.ResolverName, request.Token!);
            }
            catch (DomainException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{id}/resolve")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.TestAgent},{UserRoles.TestSpecialist}")]
        public async Task<IActionResult> ResolveTicket(int id, TicketsHandshakeDto request)
        {
            if (!IsTestAssumer)
                return Forbid();

            var ticket = await _context.TestTickets.FindAsync(id);
            if (ticket is null)
                return NotFound();

            if (ticket.ResolverId != request.ResolverId && !IsMaster)
                return Unauthorized("Apenas o responsável responsável pode finalizar este ticket.");

            try
            {
                ticket.Resolve((int)CurrentUserId);
            }
            catch (DomainException ex)
            {
                return BadRequest(ex.Message);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _context.TestTickets.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
            if (ticket is null)
                return NotFound();

            if (!IsMaster && !IsTestAssumer && ticket.RequesterId != CurrentUserId)
                return Forbid();

            return Ok(MapToResponse(ticket, CurrentUserId, IsMaster, IsTestAssumer));
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            bool isOpenerOnly = IsOpener && !IsTestAssumer;

            IQueryable<TestTickets> query = _context.TestTickets.AsNoTracking();

            if (isOpenerOnly)
                query = query.Where(t => t.RequesterId == CurrentUserId);

            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tickets.Select(t => MapToResponse(t, CurrentUserId, IsMaster, IsTestAssumer)));
        }

        private static TestTicketsResponseDto MapToResponse(TestTickets t, long currentUserId, bool isMaster, bool isTestAssumer)
        {
            return new TestTicketsResponseDto
            {
                Id = t.Id,
                RequesterId = t.RequesterId,
                RequesterName = t.RequesterName,
                TestType = t.TestType,
                Status = t.Status,
                ConfirmationToken = (t.RequesterId == currentUserId || isMaster ||
                                    (isTestAssumer && t.Status == TicketStatus.Open))
                                    ? t.ConfirmationToken
                                    : null,
                CreatedAt = t.CreatedAt,
                LineCategory = t.LineCategory.ToString(),
                LineName = t.LineName,
                Product = t.Product,
                IsLineStopped = t.IsLineStopped,
                LineStoppedTime = t.LineStoppedTime,
                Observation = t.Observation,
                ResolverId = t.ResolverId,
                ResolverName = t.ResolverName,
                ChecklistStatus = t.ChecklistStatus
            };
        }
    }
}