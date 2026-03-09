using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public class TestTicketsResponseDto
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public string? RequesterName { get; set; }
        public TestTicketType TestType { get; set; }
        public TicketStatus Status { get; set; }
        public string? ConfirmationToken { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public string LineCategory { get; set; } = string.Empty;
        public string LineName { get; set; } = string.Empty;
        public string? Product { get; set; }

        public bool IsLineStopped { get; set; }
        public string? LineStoppedTime { get; set; }
        public string Observation { get; set; } = string.Empty;
        public int? ResolverId { get; set; }
        public string? ResolverName { get; set; }
        public ChecklistStatus ChecklistStatus { get; set; }
    }
}