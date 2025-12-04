namespace inv_flow_backend.Services.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Sends an invoice email to the customer
    /// </summary>
    /// <param name="invoiceId">The invoice ID</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendInvoiceEmailAsync(int invoiceId);
}



