using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using inv_flow_backend.Models.Enums;

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
    public DateOnly Date { get; set; }

    public int? AccountId { get; set; }

    public int? VendorId { get; set; }

    [MaxLength(200)]
    public string? VendorName { get; set; } // Denormalized for historical reference

    public int? Pax { get; set; } // Number of persons for per-person expenses (e.g., buggy rides)

    [Required]
    public ExpensePaymentStatus PaymentStatus { get; set; } = ExpensePaymentStatus.Unpaid;

    public DateOnly? PaidDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
    public ExpenseType ExpenseType { get; set; } = null!;
    public Account? Account { get; set; }
    public Vendor? Vendor { get; set; }
}

