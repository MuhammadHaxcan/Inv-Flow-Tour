using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inv_flow_backend.Models;

public class Transaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public int? InvoiceId { get; set; }

    [MaxLength(50)]
    public string? InvoiceNumber { get; set; }

    [Required]
    public int AccountId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Credit { get; set; } = 0;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Debit { get; set; } = 0;

    [MaxLength(100)]
    public string? Reference { get; set; }

    [MaxLength(200)]
    public string? ExpenseType { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Invoice? Invoice { get; set; }
    public Account Account { get; set; } = null!;
}

