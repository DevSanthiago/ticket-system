public class ExternalLoginRequestDto
{
    public int Registration { get; set; }
    public string? Password { get; set; }
}

public class ExternalLoginResponseDto
{
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshExpires { get; set; }
}

public class ExternalUserListResponseDto
{
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public List<ExternalUserSummaryDto> Items { get; set; } = [];
}

public class ExternalUserSummaryDto
{
    public long Id { get; set; }
    public int Registration { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Department { get; set; }
}

public class ExternalRoleDto
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
}

public class LoginRequestDto
{
    public int Registration { get; set; }
    public string? Password { get; set; }
}

public class LoginResponseDto
{
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshExpires { get; set; }
    public string? UserName { get; set; }
    public string? Department { get; set; }
    public List<string> Roles { get; set; } = [];
}