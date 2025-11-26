using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inv_flow_backend.Models;

public class Payment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public int AccountId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateOnly Date { get; set; }

    [MaxLength(100)]
    public string? Reference { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Vat { get; set; } = 0;

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public Account Account { get; set; } = null!;
}

