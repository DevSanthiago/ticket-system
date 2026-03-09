using TicketSystem.API.Dtos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TicketSystem.API.Domain.Exceptions;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Models
{
    public class SoftwareTickets
    {
        [Key]
        public int Id { get; private set; }
        public string TargetDepartment { get; private set; } = "engenharia de software";
        public TicketStatus Status { get; private set; } = TicketStatus.Open;

        [Required]
        [MaxLength(10)]
        public string ConfirmationToken { get; private set; } = string.Empty;

        [Required]
        public SoftwareSector Sector { get; private set; }

        [Required]
        public SoftwareProblem Problem { get; private set; }

        [MaxLength(200)]
        public string? PostLocation { get; private set; }

        public int? ProductionLineId { get; private set; }

        [ForeignKey("ProductionLineId")]
        public ProductionLine? ProductionLine { get; private set; }

        [Required]
        [MaxLength(1000)]
        public string NecessaryInfo { get; private set; } = string.Empty;
        public bool IsLineStopped { get; private set; }

        [MaxLength(10)]
        public string? LineStoppedTime { get; private set; }

        public int RequesterId { get; private set; }
        public string? RequesterName { get; private set; }
        public int? ResolverId { get; private set; }
        public string? ResolverName { get; private set; }
        public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? StartedAt { get; private set; }
        public DateTimeOffset? FinishedAt { get; private set; }

        protected SoftwareTickets() { }

        public static SoftwareTickets Create(int requesterId, string requesterName, CreateSoftwareTicketDto dto, ProductionLine? line)
        {
            if (requesterId <= 0)
                throw new DomainException("Requester inválido.");

            if (dto.ProductionLineId.HasValue && line == null)
                throw new DomainException("A linha de produção informada não foi encontrada.");

            if (line == null && string.IsNullOrWhiteSpace(dto.PostLocation))
                throw new DomainException("É necessário informar a Linha de Produção ou a Localização do Posto.");

            return new SoftwareTickets
            {
                RequesterId = requesterId,
                RequesterName = requesterName,
                Sector = dto.Sector,
                Problem = dto.Problem,
                ProductionLineId = line?.Id,
                PostLocation = line != null ? null : dto.PostLocation,
                IsLineStopped = dto.IsLineStopped ?? false,
                LineStoppedTime = dto.IsLineStopped == true ? dto.LineStoppedTime : null,
                NecessaryInfo = dto.NecessaryInfo,
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