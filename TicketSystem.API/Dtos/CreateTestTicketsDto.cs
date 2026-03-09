using System.ComponentModel.DataAnnotations;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public record CreateTestTicketsDto(
        [Required] int ProductionLineId,
        [Required] TestTicketType TestType,
        string? LineName,
        string? Product,
        bool IsLineStopped,
        string? LineStoppedTime,
        string? Observation
    );
}