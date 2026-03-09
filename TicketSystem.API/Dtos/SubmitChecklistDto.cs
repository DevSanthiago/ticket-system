namespace TicketSystem.API.Dtos
{
    public record SubmitChecklistDto(
        int TicketId,
        string ChecklistContent 
    );
}