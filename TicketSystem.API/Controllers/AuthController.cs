using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TicketSystem.API.Services;

namespace TicketSystem.API.Controllers
{
    public record LoginRequest(int Registration, string Password);

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ExternalAuthService _externalAuthService;
        private readonly IConfiguration _configuration;

        public AuthController(ExternalAuthService externalAuthService, IConfiguration configuration)
        {
            _externalAuthService = externalAuthService;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request.Registration == 0 || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Matrícula e senha são obrigatórios." });

            try
            {
                var externalLogin = await _externalAuthService.LoginAsync(request.Registration, request.Password);

                if (externalLogin.Token is null)
                    return Unauthorized(new { message = "Falha ao obter token externo." });

                var user = await _externalAuthService.GetUserByRegistrationAsync(request.Registration, externalLogin.Token);

                if (user is null)
                    return Unauthorized(new { message = "Usuário não encontrado." });

                var roles = await _externalAuthService.GetUserRolesAsync(user.Id, externalLogin.Token);
                var roleNames = roles.Select(r => r.Name).Where(n => n != null).Cast<string>().ToList();

                var token = GenerateJwtToken(user, roleNames);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        user.Id,
                        user.Name,
                        user.Email,
                        user.Registration,
                        user.Department,
                        roles = roleNames
                    }
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Matrícula ou senha inválidos." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro interno: {ex.Message}" });
            }
        }

        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return string.IsNullOrEmpty(userId)
                ? Unauthorized()
                : Ok(new { message = "Token válido", userId });
        }

        private string GenerateJwtToken(ExternalUserSummaryDto user, List<string> roles)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var expireHours = int.Parse(_configuration["Jwt:ExpireHours"] ?? "8");

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Name ?? string.Empty),
                new("Registration", user.Registration.ToString()),
                new("Department", user.Department ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer,
                audience,
                claims,
                expires: DateTime.UtcNow.AddHours(expireHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}