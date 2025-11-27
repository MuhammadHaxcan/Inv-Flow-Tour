namespace inv_flow_backend.DTOs;

public class SignatureDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageData { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSignatureDto
{
    public string Name { get; set; } = string.Empty;
    public string ImageData { get; set; } = string.Empty; // Base64 encoded signature
}

public class UpdateSignatureDto
{
    public string? Name { get; set; }
    public string? ImageData { get; set; }
}
