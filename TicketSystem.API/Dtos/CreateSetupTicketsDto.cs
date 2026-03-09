using System.ComponentModel.DataAnnotations;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public record CreateSetupTicketsDto(
        [Required] int ProductionLineId,
        [Required] SetupTicketType SetupType,
        string? LineCategory,
        string? LineName,
        string? Product,
        bool IsLineStopped,
        string? LineStoppedTime,
        string? RequestedMaterial,
        string? Observation
    );
}