using System.ComponentModel.DataAnnotations;

namespace inv_flow_backend.Models;

public class CompanySettings
{
    [Key]
    public int Id { get; set; }

    [MaxLength(200)]
    public string CompanyName { get; set; } = "SIYYAD KHAN TOURISM LLC";

    public string? LogoImageData { get; set; } // Base64 encoded logo image

    [MaxLength(100)]
    public string? LogoFileName { get; set; }

    public int? ActiveSignatureId { get; set; }

    // Company Details
    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(100)]
    public string? Website { get; set; }

    [MaxLength(50)]
    public string? TRN { get; set; } // Tax Registration Number

    // Email / SMTP settings
    [MaxLength(200)]
    public string? SmtpHost { get; set; }

    public int? SmtpPort { get; set; }

    [MaxLength(200)]
    public string? SmtpUser { get; set; }

    [MaxLength(500)]
    public string? SmtpPassword { get; set; }

    [MaxLength(200)]
    public string? FromEmail { get; set; }

    [MaxLength(200)]
    public string? FromName { get; set; }

    public bool EnableSsl { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public Signature? ActiveSignature { get; set; }
}
