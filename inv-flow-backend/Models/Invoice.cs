using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace inv_flow_backend.Models;

public class Invoice
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Number { get; set; } = string.Empty;

    [Required]
    public DateOnly Date { get; set; }

    [Required]
    public int CustomerId { get; set; }

    public int? DriverId { get; set; }

    [Required]
    public int Persons { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Paid { get; set; } = 0;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "unpaid"; // 'unpaid', 'partial', 'paid'

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Vat { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public Driver? Driver { get; set; }
    public ICollection<InvoiceServiceItem> InvoiceServices { get; set; } = new List<InvoiceServiceItem>();
    public ICollection<InvoiceExpense> InvoiceExpenses { get; set; } = new List<InvoiceExpense>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

