using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inv_flow_backend.Models;

public class InvoiceServiceItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public int ServiceId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ServiceName { get; set; } = string.Empty; // Denormalized for historical reference

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Rate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public Service Service { get; set; } = null!;
}

