using System.ComponentModel.DataAnnotations;

namespace TicketSystem.API.Dtos
{
    public record TicketsHandshakeDto(
        string? Token,
        [Required] int ResolverId,
        string ResolverName = "Responsável"
    );
}