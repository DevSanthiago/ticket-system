using TicketSystem.API.Dtos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TicketSystem.API.Domain.Exceptions;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Models
{
    [Table("SetupTickets")]
    public class SetupTickets
    {
        [Key]
        public int Id { get; private set; }

        public string TargetDepartment { get; private set; } = "engenharia de setup";
        public SetupTicketType SetupType { get; private set; }
        public TicketStatus Status { get; private set; } = TicketStatus.Open;

        [Required]
        [MaxLength(10)]
        public string ConfirmationToken { get; private set; } = string.Empty;

        [Required]
        public string LineCategory { get; private set; } = string.Empty;

        [Required]
        public string LineName { get; private set; } = string.Empty;
        public string? Product { get; private set; }

        public bool IsLineStopped { get; private set; }
        public string? LineStoppedTime { get; private set; }
        public string? RequestedMaterial { get; private set; }

        public string Observation { get; private set; } = string.Empty;

        public ChecklistStatus ChecklistStatus { get; private set; } = ChecklistStatus.NotRequired;

        public string? ChecklistJson { get; private set; }

        public int RequesterId { get; private set; }
        public string? RequesterName { get; private set; }

        public int? ResolverId { get; private set; }
        public string? ResolverName { get; private set; }

        public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? StartedAt { get; private set; }
        public DateTimeOffset? FinishedAt { get; private set; }

        [Required]
        public int ProductionLineId { get; private set; }

        [ForeignKey(nameof(ProductionLineId))]
        public ProductionLine ProductionLine { get; private set; } = null!;

        private SetupTickets() { }

        public static SetupTickets Create(int requesterId, string requesterName, ProductionLine line, CreateSetupTicketsDto dto)
        {
            if (dto.SetupType == SetupTicketType.LineSetup &&
                dto.IsLineStopped &&
                string.IsNullOrWhiteSpace(dto.LineStoppedTime))
                throw new DomainException("Se a linha está parada, o horário é obrigatório.");

            if (dto.SetupType == SetupTicketType.MaterialRequest &&
                string.IsNullOrWhiteSpace(dto.RequestedMaterial))
                throw new DomainException("Descreva o material solicitado.");

            return new SetupTickets
            {
                RequesterId = requesterId,
                RequesterName = requesterName,
                ProductionLineId = line.Id,
                SetupType = dto.SetupType,
                LineCategory = line.Prefix,
                LineName = line.LineName,
                Product = dto.Product,
                IsLineStopped = dto.IsLineStopped,
                LineStoppedTime = dto.LineStoppedTime,
                RequestedMaterial = dto.RequestedMaterial,
                Observation = dto.Observation ?? string.Empty,
                ConfirmationToken = Random.Shared.Next(1000, 9999).ToString()
            };
        }

        public void Start(int resolverId, string resolverName, string token)
        {
            if (Status != TicketStatus.Open)
                throw new DomainException("Ticket não está aberto.");
            if (ConfirmationToken != token)
                throw new DomainException("Token inválido.");
            Status = TicketStatus.InProgress;
            ResolverId = resolverId;
            ResolverName = resolverName;
            StartedAt = DateTimeOffset.UtcNow;
        }

        public void Resolve()
        {
            if (Status != TicketStatus.InProgress)
                throw new DomainException("Ticket não está em andamento.");

            Status = TicketStatus.Resolved;
            FinishedAt = DateTimeOffset.UtcNow;

            ChecklistStatus =
                SetupType == SetupTicketType.LineSetup
                    ? ChecklistStatus.Pending
                    : ChecklistStatus.Completed;
        }

        public void SubmitChecklist(int requesterId, string checklistJsonContent)
        {
            if (RequesterId != requesterId)
                throw new DomainException("Acesso negado.");

            if (ChecklistStatus != ChecklistStatus.Pending)
                throw new DomainException("Checklist não pendente.");

            ChecklistStatus = ChecklistStatus.Completed;
            ChecklistJson = checklistJsonContent;
        }
    }
}