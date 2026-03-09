namespace TicketSystem.API.Dtos
{
    public class TicketTransportResponseDto
    {
        public string Url { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int TicketId { get; set; }
        public string Department { get; set; } = string.Empty;
    }
}
