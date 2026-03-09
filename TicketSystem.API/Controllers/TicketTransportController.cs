using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketSystem.API.Data;
using System.Security.Claims;
using TicketSystem.API.Dtos;
using TicketSystem.API.Utils;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/TicketTransport")]
    [Authorize]
    public class TicketTransportController(AppDbContext context, IConfiguration configuration) : ControllerBase
    {
        private readonly AppDbContext _context = context;
        private readonly IConfiguration _configuration = configuration;

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private bool IsMaster => User.IsInRole(UserRoles.Admin);

        private const string AllRoles =
            $"{UserRoles.Admin},{UserRoles.Operator},{UserRoles.Requester}," +
            $"{UserRoles.InventoryClerk},{UserRoles.TeamLead},{UserRoles.QualityChecker}," +
            $"{UserRoles.BackOfficeClerk},{UserRoles.Specialist}," +
            $"{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist},{UserRoles.ProcessSpecialist}," +
            $"{UserRoles.SetupAgent},{UserRoles.TestAgent}," +
            $"{UserRoles.AutomationAgent},{UserRoles.SoftwareAgent}," +
            $"{UserRoles.SoftwareSpecialist}";

        [HttpGet("automation/{ticketId}")]
        [Authorize(Roles = AllRoles)]
        public async Task<IActionResult> GetAutomationTicketTransport(int ticketId)
        {
            var ticket = await _context.AutomationTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return NotFound(new { message = "Ticket de automação não encontrado." });
            if (!IsMaster && ticket.RequesterId != CurrentUserId) return Forbid();

            var groupLink = _configuration["SupportAutomation:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Automação não configurado no servidor." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildAutomationMessage(ticket),
                TicketId = ticket.Id,
                Department = "Automação"
            });
        }

        [HttpGet("setup/{ticketId}")]
        [Authorize(Roles = AllRoles)]
        public async Task<IActionResult> GetSetupTicketTransport(int ticketId)
        {
            var ticket = await _context.SetupTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return NotFound(new { message = "Ticket de setup não encontrado." });
            if (!IsMaster && ticket.RequesterId != CurrentUserId) return Forbid();

            var groupLink = _configuration["SupportSetup:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Setup não configurado no servidor." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildSetupMessage(ticket),
                TicketId = ticket.Id,
                Department = "Setup"
            });
        }

        [HttpGet("test/{ticketId}")]
        [Authorize(Roles = AllRoles)]
        public async Task<IActionResult> GetTestTicketTransport(int ticketId)
        {
            var ticket = await _context.TestTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return NotFound(new { message = "Ticket de teste não encontrado." });
            if (!IsMaster && ticket.RequesterId != CurrentUserId) return Forbid();

            var groupLink = _configuration["SupportTest:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Teste não configurado no servidor." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildTestMessage(ticket),
                TicketId = ticket.Id,
                Department = "Teste"
            });
        }

        [HttpGet("software/{ticketId}")]
        [Authorize(Roles = AllRoles)]
        public async Task<IActionResult> GetSoftwareTicketTransport(int ticketId)
        {
            var ticket = await _context.SoftwareTickets
                .AsNoTracking()
                .Include(t => t.ProductionLine)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return NotFound(new { message = "Ticket de software não encontrado." });
            if (!IsMaster && ticket.RequesterId != CurrentUserId) return Forbid();

            var groupLink = _configuration["SupportSoftware:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Software não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildSoftwareMessage(ticket),
                TicketId = ticket.Id,
                Department = "Software"
            });
        }
    }
}