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
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Text.Json;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/setup-tickets")]
    public class SetupTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ExternalAuthService _externalAuth;

        public SetupTicketsController(AppDbContext context, ExternalAuthService externalAuth)
        {
            _context = context;
            _externalAuth = externalAuth;
        }

        private long CurrentUserId =>
            long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private string CurrentUserName =>
            User.FindFirstValue(ClaimTypes.Name) ?? "Usuário Desconhecido";

        private string? CurrentUserDepartment =>
            User.FindFirstValue("Department") ?? User.FindFirstValue("department");

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

        private bool IsSetupAssumer =>
            IsMaster ||
            IsInRole(UserRoles.SetupAgent) ||
            IsInRole(UserRoles.Specialist) ||
            IsInRole(UserRoles.TestSpecialist) ||
            IsInRole(UserRoles.ProductSpecialist) ||
            IsInRole(UserRoles.ProcessSpecialist) ||
            IsInRole(UserRoles.SoftwareSpecialist);

        private bool CanManageChecklist => IsMaster || IsInRole(UserRoles.SetupAgent);

        [HttpGet("check-pending-checklist")]
        [Authorize]
        public async Task<IActionResult> CheckPendingChecklist()
        {
            if (CurrentUserId == 0) return Unauthorized();

            var pending = await _context.SetupTickets
                .AsNoTracking()
                .AnyAsync(t =>
                    t.RequesterId == CurrentUserId &&
                    t.ChecklistStatus == ChecklistStatus.Pending);

            return Ok(new { isBlocked = pending });
        }

        [HttpPost("open")]
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Operator},{UserRoles.Requester}," +
                           $"{UserRoles.InventoryClerk},{UserRoles.TeamLead},{UserRoles.QualityChecker}," +
                           $"{UserRoles.BackOfficeClerk},{UserRoles.Specialist}," +
                           $"{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist},{UserRoles.ProcessSpecialist}," +
                           $"{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> OpenTicket(CreateSetupTicketsDto request)
        {
            if (CurrentUserId == 0) return Unauthorized();

            var productionLine = await _context.ProductionLines
                .AsNoTracking()
                .FirstOrDefaultAsync(pl => pl.Id == request.ProductionLineId);

            if (productionLine == null)
                return BadRequest("Linha de produção não encontrada.");

            try
            {
                var ticket = SetupTickets.Create((int)CurrentUserId, CurrentUserName, productionLine, request);
                _context.SetupTickets.Add(ticket);
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
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.SetupAgent}," +
                           $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
                           $"{UserRoles.ProcessSpecialist},{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> StartTicket(int id, TicketsHandshakeDto request)
        {
            if (!IsSetupAssumer) return Forbid();

            var ticket = await _context.SetupTickets.FindAsync(id);
            if (ticket is null) return NotFound("Ticket não encontrado.");

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
        [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.SetupAgent}," +
                           $"{UserRoles.Specialist},{UserRoles.TestSpecialist},{UserRoles.ProductSpecialist}," +
                           $"{UserRoles.ProcessSpecialist},{UserRoles.SoftwareSpecialist}")]
        public async Task<IActionResult> ResolveTicket(int id, TicketsHandshakeDto request)
        {
            if (!IsSetupAssumer) return Forbid();

            var ticket = await _context.SetupTickets.FindAsync(id);
            if (ticket is null) return NotFound();

            if (ticket.ResolverId != request.ResolverId && !IsMaster)
                return Unauthorized("Apenas o responsável responsável pode finalizar este ticket.");

            try
            {
                ticket.Resolve();
                await _context.SaveChangesAsync();
                return Ok(new { checklistRequired = ticket.ChecklistStatus == ChecklistStatus.Pending });
            }
            catch (DomainException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("submit-checklist")]
        [Authorize]
        public async Task<IActionResult> SubmitChecklist(SubmitChecklistDto request)
        {
            if (CurrentUserId == 0) return Unauthorized();

            var ticket = await _context.SetupTickets.FindAsync(request.TicketId);
            if (ticket is null) return NotFound();

            try
            {
                ticket.SubmitChecklist((int)CurrentUserId, request.ChecklistContent);
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
            var ticket = await _context.SetupTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket is null) return NotFound();

            if (!IsMaster && !IsSetupAssumer && ticket.RequesterId != CurrentUserId)
                return Forbid();

            var response = MapToResponse(ticket, CurrentUserId, IsMaster, IsSetupAssumer, CanManageChecklist);
            return Ok(response);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            bool isOpenerOnly = IsOpener && !IsSetupAssumer;

            IQueryable<SetupTickets> query = _context.SetupTickets.AsNoTracking();

            if (isOpenerOnly)
                query = query.Where(t => t.RequesterId == CurrentUserId);

            var tickets = await query
                .OrderByDescending(t => t.ChecklistStatus == ChecklistStatus.Pending)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            var response = tickets.Select(t => MapToResponse(t, CurrentUserId, IsMaster, IsSetupAssumer, CanManageChecklist));
            return Ok(response);
        }

        private static SetupTicketsResponseDto MapToResponse(SetupTickets t, long currentUserId, bool isMaster, bool isSetupAssumer, bool canManageChecklist)
        {
            return new SetupTicketsResponseDto
            {
                Id = t.Id,
                RequesterId = t.RequesterId,
                RequesterName = t.RequesterName,
                SetupType = t.SetupType,
                Status = t.Status,
                ConfirmationToken = (t.RequesterId == currentUserId || isMaster || (isSetupAssumer && t.Status == TicketStatus.Open))
                                    ? t.ConfirmationToken : null,
                CreatedAt = t.CreatedAt,
                LineCategory = t.LineCategory.ToString(),
                LineName = t.LineName,
                Product = t.Product,
                Observation = t.Observation,
                IsLineStopped = t.IsLineStopped,
                LineStoppedTime = t.LineStoppedTime,
                RequestedMaterial = t.RequestedMaterial,
                ResolverId = t.ResolverId,
                ResolverName = t.ResolverName,
                ChecklistStatus = t.ChecklistStatus,
                ChecklistContent = (canManageChecklist || t.RequesterId == currentUserId || t.ChecklistStatus == ChecklistStatus.Completed)
                                    ? t.ChecklistJson : null,
                StartedAt = t.StartedAt,
                FinishedAt = t.FinishedAt
            };
        }

        [HttpGet("{id}/pdf")]
        [Authorize]
        public async Task<IActionResult> DownloadPdf(int id)
        {
            var ticket = await _context.SetupTickets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket is null) return NotFound("Ticket não encontrado.");

            if (string.IsNullOrEmpty(ticket.ChecklistJson))
                return BadRequest("Este ticket ainda não possui um checklist preenchido.");

            var checklistData = JsonSerializer.Deserialize<ChecklistContentData>(ticket.ChecklistJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (checklistData is null) return BadRequest("Erro ao ler dados do checklist.");

            var itensChecklist = new string[]
            {
                "1. Conferir o escoamento da linha",
                "2. Documento de linha",
                "3. Layout",
                "4. Ajustar bancadas conforme o layout",
                "5. Cabo de rede",
                "6. Scanner de qr code ou barra",
                "7. Mouses",
                "8. Teclados",
                "9. Parafusadeira",
                "10. Soprador",
                "11. Verificar se as bancadas estão corretas",
                "12. Ligar todas as bancadas",
                "13. Verificar as mantas das bancadas",
                "14. Verificar os fios de aterramentos",
                "15. Seladora",
                "16. Balança",
                "17. Requester",
                "18. Notebook",
                "19. CPUs",
                "20. Máquinas Laser",
                "21. Ionizador",
                "22. Conferir o funcionamento de todos os equipamentos abastecidos",
                "23. Conferir estruturação da linha",
                "24. Recolher equipamentos que não estão no layout ou no proceso",
                "25. Validação de 5S da linha junto ao requester/lider",
                "26. Verificar postos críticos e instalar placas conforme a IT",
                "27. Conferir a instalação de mouse pads nas bancadas"
            };

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("CHECKLIST ENGENHARIA DE SETUP").FontSize(16).SemiBold().FontColor(Colors.Blue.Medium);
                            col.Item().Text($"Ticket #{ticket.Id} - {ticket.LineName}").FontSize(12);
                            col.Item().Text($"Categoria: {ticket.LineCategory}").FontSize(10).FontColor(Colors.Grey.Medium);
                        });

                        row.ConstantItem(100).AlignRight().Column(col =>
                        {
                            col.Item().Text(DateTime.Now.ToString("dd/MM/yyyy"));
                            col.Item().Text("FI 12 70").Bold();
                        });
                    });

                    page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                    {
                        col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Produto Atual (Rodando)").FontSize(9).FontColor(Colors.Grey.Darken2);
                                c.Item().Text(checklistData.ProdutoAtual).Bold();
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Produto Setup (Entrando)").FontSize(9).FontColor(Colors.Grey.Darken2);
                                c.Item().Text(checklistData.ProdutoSetup).Bold();
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Líder da Linha").FontSize(9).FontColor(Colors.Grey.Darken2);
                                c.Item().Text(checklistData.LiderLinha).Bold();
                            });
                        });

                        col.Item().Height(15);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("OK");
                                header.Cell().Element(CellStyle).Text("Item de Verificação");
                            });

                            for (int i = 0; i < itensChecklist.Length; i++)
                            {
                                var isChecked = i < checklistData.Checks.Count && checklistData.Checks[i];
                                var itemText = itensChecklist[i];
                                var bgColor = i % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;

                                table.Cell().Background(bgColor).Padding(5).AlignCenter().Text(isChecked ? "X" : "").Bold();
                                table.Cell().Background(bgColor).Padding(5).Text(itemText);
                            }
                        });

                        static IContainer CellStyle(IContainer container)
                        {
                            return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).DefaultTextStyle(x => x.Bold());
                        }

                        col.Item().Height(15);

                        col.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                        {
                            c.Item().Text("Observações do Requester:").Bold();
                            c.Item().Text(string.IsNullOrWhiteSpace(checklistData.Observacao) ? "Sem observações." : checklistData.Observacao).Italic();
                        });
                    });

                    page.Footer().Column(col =>
                    {
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                        col.Item().PaddingTop(5).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Assinado Digitalmente por:").FontSize(8);
                                c.Item().Text(checklistData.AssinadoPor).Bold();
                                c.Item().Text($"Data: {checklistData.DataAssinatura}").FontSize(8);
                            });

                            row.RelativeItem().AlignRight().Text(x =>
                            {
                                x.Span("Página ");
                                x.CurrentPageNumber();
                                x.Span(" de ");
                                x.TotalPages();
                            });
                        });
                    });
                });
            });

            var pdfBytes = document.GeneratePdf();
            return File(pdfBytes, "application/pdf", $"checklist_setup_{id}.pdf");
        }
    }
}