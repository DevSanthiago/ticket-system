using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public class SoftwareTicketResponseDto
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public string? RequesterName { get; set; }
        public TicketStatus Status { get; set; }
        public string? ConfirmationToken { get; set; }
        public string Sector { get; set; } = string.Empty;
        public string Problem { get; set; } = string.Empty;
        public string PostLocation { get; set; } = string.Empty;
        public int? ProductionLineId { get; set; }
        public string NecessaryInfo { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? StartedAt { get; set; }
        public DateTimeOffset? FinishedAt { get; set; }
        public int? ResolverId { get; set; }
        public string? ResolverName { get; set; }
        public bool IsLineStopped { get; set; }
        public string? LineStoppedTime { get; set; }
    }
}