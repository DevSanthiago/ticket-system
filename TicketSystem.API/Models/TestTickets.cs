using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TicketSystem.API.Domain.Exceptions;
using TicketSystem.API.Dtos;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Models
{
    [Table("TestTickets")]
    public class TestTickets
    {
        [Key]
        public int Id { get; private set; }

        public string TargetDepartment { get; private set; } = "Test";
        public TestTicketType TestType { get; private set; }
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

        [MaxLength(500)]
        public string Observation { get; private set; } = string.Empty;

        public ChecklistStatus ChecklistStatus { get; private set; } = ChecklistStatus.NotRequired;

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

        private TestTickets() { }

        public static TestTickets Create(int requesterId, string requesterName, ProductionLine line, CreateTestTicketsDto dto)
        {
            if (dto.IsLineStopped && string.IsNullOrWhiteSpace(dto.LineStoppedTime))
                throw new DomainException("Se a linha está parada, o horário é obrigatório.");

            return new TestTickets
            {
                RequesterId = requesterId,
                RequesterName = requesterName,
                ProductionLineId = line.Id,
                TestType = dto.TestType,

                LineCategory = line.Prefix,
                LineName = line.LineName,

                IsLineStopped = dto.IsLineStopped,
                LineStoppedTime = dto.LineStoppedTime,
                Product = dto.Product,
                Observation = dto.Observation ?? string.Empty,
                ConfirmationToken = Random.Shared.Next(1000, 9999).ToString(),
                ChecklistStatus = ChecklistStatus.NotRequired
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

        public void Resolve(int resolverId)
        {
            if (Status != TicketStatus.InProgress)
                throw new DomainException("Ticket não está em andamento.");

            if (ResolverId != resolverId)
                throw new DomainException("Responsável inválido.");

            Status = TicketStatus.Resolved;
            ChecklistStatus = ChecklistStatus.Completed;
            FinishedAt = DateTimeOffset.UtcNow;
        }
    }
}