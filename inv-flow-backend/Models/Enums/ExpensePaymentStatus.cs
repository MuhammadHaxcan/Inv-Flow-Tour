namespace inv_flow_backend.Models.Enums;

/// <summary>
/// Represents the payment status of an expense
/// </summary>
public enum ExpensePaymentStatus
{
    /// <summary>
    /// Expense has not been paid
    /// </summary>
    Unpaid = 0,
    
    /// <summary>
    /// Expense has been paid
    /// </summary>
    Paid = 1
}

