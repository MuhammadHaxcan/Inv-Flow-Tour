namespace inv_flow_backend.DTOs;

public class DriverDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class CreateDriverDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class UpdateDriverDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

