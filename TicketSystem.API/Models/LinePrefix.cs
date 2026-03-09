using System.ComponentModel.DataAnnotations;

namespace TicketSystem.API.Models
{
    public class LinePrefix
    {
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string Value { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Label { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}