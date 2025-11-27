namespace inv_flow_backend.DTOs;

public class CompanySettingsDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoImageData { get; set; }
    public string? LogoFileName { get; set; }
    public int? ActiveSignatureId { get; set; }
    public SignatureDto? ActiveSignature { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? TRN { get; set; }
}

public class UpdateCompanySettingsDto
{
    public string? CompanyName { get; set; }
    public string? LogoImageData { get; set; }
    public string? LogoFileName { get; set; }
    public int? ActiveSignatureId { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? TRN { get; set; }
}

public class UpdateLogoDto
{
    public string LogoImageData { get; set; } = string.Empty; // Base64 encoded logo
    public string? FileName { get; set; }
}

public class SetActiveSignatureDto
{
    public int SignatureId { get; set; }
}
