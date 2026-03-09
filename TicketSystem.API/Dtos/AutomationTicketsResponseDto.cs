using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public class AutomationTicketsResponseDto
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public string? RequesterName { get; set; }
        public AutomationTicketType TicketType { get; set; }
        public TicketStatus Status { get; set; }
        public string? ConfirmationToken { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? StartedAt { get; set; }
        public DateTimeOffset? FinishAt { get; set; }

        public required string LineCategory { get; set; }
        public required string LineName { get; set; }
        public string? Product { get; set; }
        public required string RunningProduct { get; set; }
        public required string Observation { get; set; }

        public string? LineSystem { get; set; }
        public string? SystemSupportType { get; set; }
        public string? ToolType { get; set; }
        public string? LabelValidationType { get; set; }
        public string? ProductModel { get; set; }
        public int? ResolverId { get; set; }
        public string? ResolverName { get; set; }
        public ChecklistStatus ChecklistStatus { get; set; }
        public bool IsLineStopped { get; set; }
        public string? LineStoppedTime { get; set; }
    }
}