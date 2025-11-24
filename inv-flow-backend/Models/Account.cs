using System.ComponentModel.DataAnnotations;

namespace inv_flow_backend.Models;

public class Account
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? AccountNumber { get; set; }

    [Required]
    [MaxLength(50)]
    public string AccountType { get; set; } = string.Empty; // 'cash' or 'bank'

    [MaxLength(500)]
    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

