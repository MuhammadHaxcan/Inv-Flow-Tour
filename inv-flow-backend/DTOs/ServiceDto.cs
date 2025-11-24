namespace inv_flow_backend.DTOs;

public class ServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Charge { get; set; }
    public decimal VatIncluded { get; set; }
}

public class CreateServiceDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Charge { get; set; }
    public decimal VatIncluded { get; set; }
}

public class UpdateServiceDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Charge { get; set; }
    public decimal VatIncluded { get; set; }
}

