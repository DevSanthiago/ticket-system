using System.ComponentModel.DataAnnotations;
using TicketSystem.API.Enums;

namespace TicketSystem.API.Dtos
{
    public record CreateSoftwareTicketDto(
        [Required] SoftwareSector Sector,
        [Required] SoftwareProblem Problem,
        string? PostLocation,
        int? ProductionLineId,
        [Required] string NecessaryInfo,
        bool? IsLineStopped,
        string? LineStoppedTime
    );
}