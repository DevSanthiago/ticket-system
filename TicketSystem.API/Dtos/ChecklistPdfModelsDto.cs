namespace TicketSystem.API.Dtos
{
    public class ChecklistContentData
    {
        public string ProdutoAtual { get; set; } = string.Empty;
        public string ProdutoSetup { get; set; } = string.Empty;
        public string LiderLinha { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
        public List<bool> Checks { get; set; } = new();
        public string AssinadoPor { get; set; } = string.Empty;
        public string DataAssinatura { get; set; } = string.Empty;
    }
}