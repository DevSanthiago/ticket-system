using System.ComponentModel.DataAnnotations;

namespace TicketSystem.API.Dtos
{
    public class CreateProductionLineDto
    {
        [Required(ErrorMessage = "O nome da linha é obrigatório")]
        [StringLength(50, ErrorMessage = "O nome da linha deve ter no máximo 50 caracteres")]
        public string LineName { get; set; } = string.Empty;

        [Required(ErrorMessage = "O prefixo é obrigatório")]
        [StringLength(10, ErrorMessage = "O prefixo deve ter no máximo 10 caracteres")]
        public string Prefix { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres")]
        public string? Description { get; set; }
    }

    public class UpdateProductionLineDto
    {
        [Required(ErrorMessage = "O nome da linha é obrigatório")]
        [StringLength(50, ErrorMessage = "O nome da linha deve ter no máximo 50 caracteres")]
        public string LineName { get; set; } = string.Empty;

        [Required(ErrorMessage = "O prefixo é obrigatório")]
        [StringLength(10, ErrorMessage = "O prefixo deve ter no máximo 10 caracteres")]
        public string Prefix { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres")]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class ProductionLineResponseDto
    {
        public int Id { get; set; }
        public string LineName { get; set; } = string.Empty;
        public string Prefix { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public string? UpdatedByUserName { get; set; }
    }

    public class ProductionLinesByPrefixDto
    {
        public string Prefix { get; set; } = string.Empty;
        public string PrefixLabel { get; set; } = string.Empty;
        public List<ProductionLineResponseDto> Lines { get; set; } = new();
    }

    public class CreateUserDto
    {
        [Required(ErrorMessage = "O nome de usuário é obrigatório")]
        [StringLength(50, ErrorMessage = "O nome de usuário deve ter no máximo 50 caracteres")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "O nome completo é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome completo deve ter no máximo 100 caracteres")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A matrícula é obrigatória")]
        [StringLength(20, ErrorMessage = "A matrícula deve ter no máximo 20 caracteres")]
        public string Registration { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "A senha deve ter entre 6 e 100 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "O papel/função é obrigatório")]
        public string Role { get; set; } = string.Empty;

        public int? ResolverDepartment { get; set; }
    }

    public class UpdateUserDto
    {
        [Required(ErrorMessage = "O nome de usuário é obrigatório")]
        [StringLength(50, ErrorMessage = "O nome de usuário deve ter no máximo 50 caracteres")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "O nome completo é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome completo deve ter no máximo 100 caracteres")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A matrícula é obrigatória")]
        [StringLength(20, ErrorMessage = "A matrícula deve ter no máximo 20 caracteres")]
        public string Registration { get; set; } = string.Empty;

        [StringLength(100, MinimumLength = 6, ErrorMessage = "A senha deve ter entre 6 e 100 caracteres")]
        public string? Password { get; set; }

        [Required(ErrorMessage = "O papel/função é obrigatório")]
        public string Role { get; set; } = string.Empty;

        public int? ResolverDepartment { get; set; }
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Registration { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int? ResolverDepartmentId { get; set; }
        public string? ResolverDepartmentName { get; set; }
    }

    public class CreateLinePrefixDto
    {
        [Required(ErrorMessage = "O valor do prefixo é obrigatório")]
        public string Value { get; set; } = string.Empty;

        [Required(ErrorMessage = "O rótulo do prefixo é obrigatório")]
        public string Label { get; set; } = string.Empty;
    }

    public class LinePrefixResponseDto
    {
        public int Id { get; set; }
        public string Value { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}