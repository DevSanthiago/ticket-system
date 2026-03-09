using Microsoft.AspNetCore.Mvc;

namespace TicketSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SupportController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SupportController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("contact-info")]
        public IActionResult GetSupportContact([FromQuery] string type)
        {
            var groupLink = _configuration["SupportSettings:GroupLink"];

            if (string.IsNullOrEmpty(groupLink))
                return BadRequest("Link de suporte não configurado.");

            string message = type switch
            {
                "reset_password" => "Olá, equipe! Esqueci minha senha do Ticket System e preciso de ajuda.",
                "request_access" => "Olá, equipe! Sou novo colaborador e gostaria de solicitar acesso ao Ticket System.",
                _ => "Olá, preciso de ajuda com o sistema Ticket System."
            };

            return Ok(new
            {
                url = groupLink,
                message
            });
        }
    }
}