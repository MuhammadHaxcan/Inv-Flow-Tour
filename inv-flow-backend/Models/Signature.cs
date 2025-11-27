using System.ComponentModel.DataAnnotations;

namespace inv_flow_backend.Models;

public class Signature
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string ImageData { get; set; } = string.Empty; // Base64 encoded signature image

    public bool IsActive { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
