using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public class SetupTicketsResponseDto
    {
        public int Id { get; set; }
        public TicketStatus Status { get; set; }
        public SetupTicketType SetupType { get; set; }
        public string? ConfirmationToken { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? StartedAt { get; set; }
        public DateTimeOffset? FinishedAt { get; set; }

        public int RequesterId { get; set; }
        public string? RequesterName { get; set; }

        public required string LineCategory { get; set; }
        public required string LineName { get; set; }
        public string? Product { get; set; }

        public bool IsLineStopped { get; set; }
        public string? LineStoppedTime { get; set; }
        public string? RequestedMaterial { get; set; }
        public required string Observation { get; set; }

        public int? ResolverId { get; set; }
        public string? ResolverName { get; set; }
        public ChecklistStatus ChecklistStatus { get; set; }
        public string? ChecklistContent { get; set; }
    }
}