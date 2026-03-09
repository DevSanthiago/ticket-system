using System.ComponentModel.DataAnnotations;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public record CreateAutomationTicketsDto(
        [Required] int ProductionLineId,
        [Required] AutomationTicketType TicketType,

        string? LineCategory,
        string? LineName,
        bool IsLineStopped,
        string? LineStoppedTime,

        string? Product,
        [Required] string RunningProduct,
        string? Observation,

        LineSystem? LineSystem,
        SystemSupportType? SystemSupportType,

        LineToolType? ToolType,
        LabelValidationType? LabelValidationType,

        string? ProductModel
    );
}