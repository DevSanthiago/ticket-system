using System.Net.Http.Headers;
using TicketSystem.API.Dtos;

namespace TicketSystem.API.Services
{
    public class ExternalAuthService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ExternalAuthService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<ExternalLoginResponseDto> LoginAsync(int registration, string password)
        {
            var client = _httpClientFactory.CreateClient("AccessControlAPI");

            var payload = new ExternalLoginRequestDto
            {
                Registration = registration,
                Password = password
            };

            var response = await client.PostAsJsonAsync("/access-control/api/v1/auth", payload);

            if (!response.IsSuccessStatusCode)
                throw new UnauthorizedAccessException("Credenciais inválidas.");

            return await response.Content.ReadFromJsonAsync<ExternalLoginResponseDto>()
                ?? throw new Exception("Resposta de login inválida.");
        }

        public async Task<ExternalUserSummaryDto?> GetUserByRegistrationAsync(int registration, string token)
        {
            var client = CreateAuthenticatedClient(token);

            var response = await client.GetAsync($"/access-control/api/v1/users?search={registration}&pageSize=1");

            if (!response.IsSuccessStatusCode)
                throw new Exception("Erro ao buscar usuário.");

            var result = await response.Content.ReadFromJsonAsync<ExternalUserListResponseDto>();

            return result?.Items?.FirstOrDefault();
        }

        public async Task<ExternalUserSummaryDto> GetUserByIdAsync(long userId, string token)
        {
            var client = CreateAuthenticatedClient(token);

            var response = await client.GetAsync($"/access-control/api/v1/users/{userId}");

            if (!response.IsSuccessStatusCode)
                throw new Exception("Usuário não encontrado.");

            return await response.Content.ReadFromJsonAsync<ExternalUserSummaryDto>()
                ?? throw new Exception("Resposta de usuário inválida.");
        }

        public async Task<List<ExternalRoleDto>> GetUserRolesAsync(long userId, string token)
        {
            var client = CreateAuthenticatedClient(token);

            var response = await client.GetAsync($"/access-control/api/v1/users/roles/{userId}");

            if (!response.IsSuccessStatusCode)
                throw new Exception("Roles do usuário não encontradas.");

            return await response.Content.ReadFromJsonAsync<List<ExternalRoleDto>>()
                ?? new List<ExternalRoleDto>();
        }

        private HttpClient CreateAuthenticatedClient(string token)
        {
            var client = _httpClientFactory.CreateClient("AccessControlAPI");
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
            return client;
        }
    }
}