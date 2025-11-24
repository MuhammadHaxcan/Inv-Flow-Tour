using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inv_flow_backend.Models;

public class InvoiceExpense
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public int ExpenseTypeId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Type { get; set; } = string.Empty; // Denormalized for historical reference

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public ExpenseType ExpenseType { get; set; } = null!;
}

