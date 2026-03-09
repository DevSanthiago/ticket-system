using TicketSystem.API.Dtos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TicketSystem.API.Domain.Exceptions;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Models
{
    public class AutomationTickets
    {
        [Key]
        public int Id { get; private set; }
        public string TargetDepartment { get; private set; } = "engenharia de sistemas";
        public AutomationTicketType TicketType { get; private set; }
        public TicketStatus Status { get; private set; } = TicketStatus.Open;

        [Required]
        [MaxLength(10)]
        public string ConfirmationToken { get; private set; } = string.Empty;

        [Required]
        public string LineCategory { get; private set; } = string.Empty;

        [Required]
        public string LineName { get; private set; } = string.Empty;
        public string? Product { get; private set; }

        [Required]
        public string RunningProduct { get; private set; } = string.Empty;

        [MaxLength(500)]
        public string Observation { get; private set; } = string.Empty;
        public LineSystem? LineSystem { get; private set; }
        public SystemSupportType? SystemSupportType { get; private set; }
        public LineToolType? ToolType { get; private set; }
        public LabelValidationType? LabelValidationType { get; private set; }
        public string? ProductModel { get; private set; }
        public ChecklistStatus ChecklistStatus { get; private set; } = ChecklistStatus.NotRequired;
        public string? ChecklistData { get; private set; }
        public int RequesterId { get; private set; }
        public string? RequesterName { get; private set; }
        public int? ResolverId { get; private set; }
        public string? ResolverName { get; private set; }
        public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? StartedAt { get; private set; }
        public DateTimeOffset? FinishedAt { get; private set; }
        public bool IsLineStopped { get; private set; } = false;
        public string? LineStoppedTime { get; private set; }

        [Required]
        public int ProductionLineId { get; private set; }

        [ForeignKey(nameof(ProductionLineId))]
        public ProductionLine ProductionLine { get; private set; } = null!;

        protected AutomationTickets() { }

        public static AutomationTickets Create(int requesterId, string requesterName, ProductionLine line, CreateAutomationTicketsDto dto)
        {
            if (requesterId <= 0)
                throw new DomainException("Requester inválido.");

            return new AutomationTickets
            {
                RequesterId = requesterId,
                RequesterName = requesterName,
                ProductionLineId = line.Id,
                TicketType = dto.TicketType,
                LineCategory = line.Prefix,
                LineName = line.LineName,
                RunningProduct = dto.RunningProduct,
                Observation = dto.Observation ?? string.Empty,
                LineSystem = dto.LineSystem,
                SystemSupportType = dto.SystemSupportType,
                IsLineStopped = dto.IsLineStopped,
                LineStoppedTime = dto.IsLineStopped ? dto.LineStoppedTime : null,
                ToolType = dto.ToolType,
                LabelValidationType = dto.LabelValidationType,
                ProductModel = dto.ProductModel,
                ConfirmationToken = Random.Shared.Next(1000, 9999).ToString()
            };
        }

        public void Start(int resolverId, string resolverName, string token)
        {
            if (Status != TicketStatus.Open)
                throw new DomainException("O ticket não está aberto.");
            if (token != ConfirmationToken)
                throw new DomainException("Token inválido.");
            ResolverId = resolverId;
            ResolverName = resolverName;
            Status = TicketStatus.InProgress;
            StartedAt = DateTimeOffset.UtcNow;
        }

        public void Resolve()
        {
            if (Status != TicketStatus.InProgress)
                throw new DomainException("O ticket não está em andamento.");
            Status = TicketStatus.Resolved;
            FinishedAt = DateTimeOffset.UtcNow;
        }
    }
}