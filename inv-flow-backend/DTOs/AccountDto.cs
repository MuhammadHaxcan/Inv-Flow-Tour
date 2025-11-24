namespace inv_flow_backend.DTOs;

public class AccountDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AccountNumber { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public string? Details { get; set; }
}

public class CreateAccountDto
{
    public string Name { get; set; } = string.Empty;
    public string? AccountNumber { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public string? Details { get; set; }
}

public class UpdateAccountDto
{
    public string Name { get; set; } = string.Empty;
    public string? AccountNumber { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public string? Details { get; set; }
}

