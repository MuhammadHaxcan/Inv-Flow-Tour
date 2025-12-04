namespace inv_flow_backend.Models.Enums;

/// <summary>
/// Represents the payment status of an invoice
/// </summary>
public enum InvoiceStatus
{
    /// <summary>
    /// Invoice has no payments
    /// </summary>
    Unpaid = 0,
    
    /// <summary>
    /// Invoice has partial payments
    /// </summary>
    Partial = 1,
    
    /// <summary>
    /// Invoice is fully paid
    /// </summary>
    Paid = 2
}



