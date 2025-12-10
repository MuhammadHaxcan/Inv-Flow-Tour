using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using inv_flow_backend.Models.Enums;

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

    [MaxLength(500)]
    public string? DriverNotes { get; set; }

    [Required]
    public int Adults { get; set; }

    [Required]
    public int Children { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Paid { get; set; } = 0;

    [Required]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Vat { get; set; }

    public TripType TripType { get; set; } = TripType.Day;

    public TripMode TripMode { get; set; } = TripMode.Shared;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    /// <summary>
    /// Timestamp when invoice email was sent to customer
    /// </summary>
    public DateTime? EmailSentAt { get; set; }

    /// <summary>
    /// ID of the user who created this invoice
    /// </summary>
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public Driver? Driver { get; set; }
    public User? CreatedByUser { get; set; }
    public ICollection<InvoiceServiceItem> InvoiceServices { get; set; } = new List<InvoiceServiceItem>();
    public ICollection<InvoiceExpense> InvoiceExpenses { get; set; } = new List<InvoiceExpense>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

