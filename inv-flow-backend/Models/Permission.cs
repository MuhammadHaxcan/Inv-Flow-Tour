using System.ComponentModel.DataAnnotations;

namespace inv_flow_backend.Models;

public class Permission
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Resource { get; set; } // e.g., 'invoices', 'customers', 'services'

    [MaxLength(50)]
    public string? Action { get; set; } // e.g., 'read', 'write', 'delete'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

