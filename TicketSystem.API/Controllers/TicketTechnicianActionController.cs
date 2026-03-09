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
    [Route("api/ticket-actions")]
    public class TicketResolverActionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public TicketResolverActionController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private bool IsMaster => User.IsInRole(UserRoles.Admin);

        private const string AutomationAssumerRoles =
            $"{UserRoles.Admin},{UserRoles.AutomationAgent}," +
            $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
            $"{UserRoles.ProcessSpecialist},{UserRoles.SoftwareSpecialist}";

        private const string SetupAssumerRoles =
            $"{UserRoles.Admin},{UserRoles.SetupAgent}," +
            $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
            $"{UserRoles.ProcessSpecialist},{UserRoles.SoftwareSpecialist}";

        private const string TestAssumerRoles =
            $"{UserRoles.Admin},{UserRoles.TestAgent},{UserRoles.TestSpecialist}," +
            $"{UserRoles.Specialist},{UserRoles.ProductSpecialist},{UserRoles.ProcessSpecialist}," +
            $"{UserRoles.SoftwareSpecialist}";

        private const string SoftwareAssumerRoles =
            $"{UserRoles.Admin},{UserRoles.SoftwareAgent},{UserRoles.SoftwareSpecialist}," +
            $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
            $"{UserRoles.ProcessSpecialist}";

        [HttpGet("automation/start/{ticketId}")]
        [Authorize(Roles = AutomationAssumerRoles)]
        public async Task<IActionResult> GetAutomationStartMessage(int ticketId)
        {
            var ticket = await _context.AutomationTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportAutomation:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Automação não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildAutomationStartMessage(ticket),
                TicketId = ticket.Id,
                Department = "Automação"
            });
        }

        [HttpGet("automation/resolve/{ticketId}")]
        [Authorize(Roles = AutomationAssumerRoles)]
        public async Task<IActionResult> GetAutomationResolveMessage(int ticketId)
        {
            var ticket = await _context.AutomationTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportAutomation:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Automação não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildAutomationResolveMessage(ticket),
                TicketId = ticket.Id,
                Department = "Automação"
            });
        }

        [HttpGet("setup/start/{ticketId}")]
        [Authorize(Roles = SetupAssumerRoles)]
        public async Task<IActionResult> GetSetupStartMessage(int ticketId)
        {
            var ticket = await _context.SetupTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportSetup:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Setup não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildSetupStartMessage(ticket),
                TicketId = ticket.Id,
                Department = "Setup"
            });
        }

        [HttpGet("setup/resolve/{ticketId}")]
        [Authorize(Roles = SetupAssumerRoles)]
        public async Task<IActionResult> GetSetupResolveMessage(int ticketId)
        {
            var ticket = await _context.SetupTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportSetup:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Setup não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildSetupResolveMessage(ticket),
                TicketId = ticket.Id,
                Department = "Setup"
            });
        }

        [HttpGet("test/start/{ticketId}")]
        [Authorize(Roles = TestAssumerRoles)]
        public async Task<IActionResult> GetTestStartMessage(int ticketId)
        {
            var ticket = await _context.TestTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportTest:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Teste não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildTestStartMessage(ticket),
                TicketId = ticket.Id,
                Department = "Teste"
            });
        }

        [HttpGet("test/resolve/{ticketId}")]
        [Authorize(Roles = TestAssumerRoles)]
        public async Task<IActionResult> GetTestResolveMessage(int ticketId)
        {
            var ticket = await _context.TestTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null)
                return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportTest:GroupLink"];
            if (string.IsNullOrEmpty(groupLink))
                return BadRequest(new { message = "Link do Grupo de Teste não configurado." });

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildTestResolveMessage(ticket),
                TicketId = ticket.Id,
                Department = "Teste"
            });
        }

        [HttpGet("software/start/{ticketId}")]
        [Authorize(Roles = SoftwareAssumerRoles)]
        public async Task<IActionResult> GetSoftwareStartMessage(int ticketId)
        {
            var ticket = await _context.SoftwareTickets
                .AsNoTracking()
                .Include(t => t.ProductionLine)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportSoftware:GroupLink"] ?? "";

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildSoftwareStartMessage(ticket),
                TicketId = ticket.Id,
                Department = "Software"
            });
        }

        [HttpGet("software/resolve/{ticketId}")]
        [Authorize(Roles = SoftwareAssumerRoles)]
        public async Task<IActionResult> GetSoftwareResolveMessage(int ticketId)
        {
            var ticket = await _context.SoftwareTickets
                .AsNoTracking()
                .Include(t => t.ProductionLine)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket is null) return NotFound(new { message = "Ticket não encontrado." });

            if (!IsMaster && ticket.ResolverId != CurrentUserId)
                return Forbid();

            var groupLink = _configuration["SupportSoftware:GroupLink"] ?? "";

            return Ok(new TicketTransportResponseDto
            {
                Url = groupLink,
                Message = TicketMessageHelper.BuildSoftwareResolveMessage(ticket),
                TicketId = ticket.Id,
                Department = "Software"
            });
        }
    }
}