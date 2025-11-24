namespace inv_flow_backend.DTOs;

public class PermissionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Resource { get; set; }
    public string? Action { get; set; }
}

