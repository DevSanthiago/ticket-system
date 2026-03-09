using System.ComponentModel.DataAnnotations;

namespace TicketSystem.API.Models
{
    public class ProductionLine
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string LineName { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string Prefix { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public int CreatedByUserId { get; set; }

        public int? UpdatedByUserId { get; set; }

        public ICollection<SetupTickets> SetupTickets { get; set; } = [];
        public ICollection<AutomationTickets> AutomationTickets { get; set; } = [];
        public ICollection<TestTickets> TestTickets { get; set; } = [];

        public static ProductionLine Create(string lineName, string prefix, string? description, int createdByUserId)
        {
            if (string.IsNullOrWhiteSpace(lineName))
                throw new ArgumentException("O nome da linha é obrigatório.");

            if (string.IsNullOrWhiteSpace(prefix))
                throw new ArgumentException("O prefixo é obrigatório.");

            if (!System.Text.RegularExpressions.Regex.IsMatch(prefix, @"^[A-Z0-9]+$", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                throw new ArgumentException("O prefixo deve conter apenas letras e números.");

            return new ProductionLine
            {
                LineName = lineName.Trim().ToUpper(),
                Prefix = prefix.Trim().ToUpper(),
                Description = description?.Trim(),
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
        }

        public void Update(string lineName, string prefix, string? description, int updatedByUserId)
        {
            if (string.IsNullOrWhiteSpace(lineName))
                throw new ArgumentException("O nome da linha é obrigatório.");

            if (string.IsNullOrWhiteSpace(prefix))
                throw new ArgumentException("O prefixo é obrigatório.");

            if (!System.Text.RegularExpressions.Regex.IsMatch(lineName, @"^[A-Z0-9/]+$", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                throw new ArgumentException("O nome da linha deve conter apenas letras, números e barra (/).");

            if (!System.Text.RegularExpressions.Regex.IsMatch(prefix, @"^[A-Z0-9]+$", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                throw new ArgumentException("O prefixo deve conter apenas letras e números.");

            LineName = lineName.Trim().ToUpper();
            Prefix = prefix.Trim().ToUpper();
            Description = description?.Trim();
            UpdatedByUserId = updatedByUserId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate(int updatedByUserId)
        {
            IsActive = false;
            UpdatedByUserId = updatedByUserId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate(int updatedByUserId)
        {
            IsActive = true;
            UpdatedByUserId = updatedByUserId;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}