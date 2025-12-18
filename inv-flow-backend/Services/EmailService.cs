using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using Microsoft.EntityFrameworkCore;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using inv_flow_backend.Data;
using inv_flow_backend.Services.Interfaces;

namespace inv_flow_backend.Services;

public class EmailService : IEmailService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly ICompanySettingsService _companySettingsService;
    private static bool _browserDownloaded = false;
    private static readonly SemaphoreSlim _downloadLock = new(1, 1);

    public EmailService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<EmailService> logger,
        ICompanySettingsService companySettingsService)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _companySettingsService = companySettingsService;
    }

    private async Task EnsureBrowserDownloadedAsync()
    {
        if (_browserDownloaded) return;

        await _downloadLock.WaitAsync();
        try
        {
            if (!_browserDownloaded)
            {
                _logger.LogInformation("Downloading Chromium browser for PDF generation...");
                var browserFetcher = new BrowserFetcher();
                await browserFetcher.DownloadAsync();
                _browserDownloaded = true;
                _logger.LogInformation("Chromium browser downloaded successfully");
            }
        }
        finally
        {
            _downloadLock.Release();
        }
    }

    public async Task<bool> SendInvoiceEmailAsync(int invoiceId)
    {
        // Get invoice with all related data
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Driver)
            .Include(i => i.InvoiceServices)
                .ThenInclude(s => s.Service)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
        {
            _logger.LogWarning("Invoice {InvoiceId} not found for email sending", invoiceId);
            throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found");
        }

        if (string.IsNullOrEmpty(invoice.Customer?.Email))
        {
            _logger.LogWarning("Customer {CustomerId} has no email address", invoice.CustomerId);
            throw new InvalidOperationException("Customer does not have an email address");
        }

        // Get company settings for branding
        var companySettings = await _companySettingsService.GetSettingsAsync();

        if (companySettings == null)
        {
            throw new InvalidOperationException("Company settings not found; cannot resolve SMTP configuration.");
        }

        var smtpHost = !string.IsNullOrWhiteSpace(companySettings.SmtpHost)
            ? companySettings.SmtpHost
            : throw new InvalidOperationException("SMTP Host not configured");

        var smtpPort = companySettings.SmtpPort ?? throw new InvalidOperationException("SMTP Port not configured");

        var smtpUser = !string.IsNullOrWhiteSpace(companySettings.SmtpUser)
            ? companySettings.SmtpUser
            : throw new InvalidOperationException("SMTP User not configured");

        var smtpPassword = !string.IsNullOrWhiteSpace(companySettings.SmtpPassword)
            ? companySettings.SmtpPassword
            : throw new InvalidOperationException("SMTP Password not configured");

        var fromEmail = !string.IsNullOrWhiteSpace(companySettings.FromEmail)
            ? companySettings.FromEmail
            : smtpUser;

        var fromName = !string.IsNullOrWhiteSpace(companySettings.FromName)
            ? companySettings.FromName
            : companySettings.CompanyName ?? "Invoice System";

        var enableSsl = companySettings.EnableSsl;

        // Build the invoice HTML for PDF
        var invoiceHtml = BuildInvoicePdfHtml(invoice, companySettings);
        
        // Generate PDF
        byte[] pdfBytes;
        try
        {
            pdfBytes = await GeneratePdfAsync(invoiceHtml);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate PDF for invoice {InvoiceNumber}", invoice.Number);
            throw new InvalidOperationException("Failed to generate invoice PDF", ex);
        }

        // Build email HTML (simpler version for email body)
        var emailHtml = BuildEmailBodyHtml(invoice, companySettings, fromName);

        try
        {
            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPassword),
                EnableSsl = enableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = $"Invoice {invoice.Number} - {fromName}",
                IsBodyHtml = true
            };
            mailMessage.To.Add(new MailAddress(invoice.Customer.Email, invoice.Customer.Name));

            // Create HTML view with inline images
            var htmlView = AlternateView.CreateAlternateViewFromString(emailHtml, Encoding.UTF8, MediaTypeNames.Text.Html);
            
            // Add logo as linked resource if available
            if (!string.IsNullOrEmpty(companySettings?.LogoImageData))
            {
                var logoBytes = Convert.FromBase64String(companySettings.LogoImageData.Split(',').Last());
                var logoStream = new MemoryStream(logoBytes);
                var logoResource = new LinkedResource(logoStream, "image/png") { ContentId = "companylogo" };
                htmlView.LinkedResources.Add(logoResource);
            }

            // Add signature as linked resource if available
            if (!string.IsNullOrEmpty(companySettings?.ActiveSignature?.ImageData))
            {
                var sigBytes = Convert.FromBase64String(companySettings.ActiveSignature.ImageData.Split(',').Last());
                var sigStream = new MemoryStream(sigBytes);
                var sigResource = new LinkedResource(sigStream, "image/png") { ContentId = "signature" };
                htmlView.LinkedResources.Add(sigResource);
            }

            mailMessage.AlternateViews.Add(htmlView);

            // Attach PDF
            var pdfStream = new MemoryStream(pdfBytes);
            var pdfAttachment = new Attachment(pdfStream, $"{invoice.Number}.pdf", "application/pdf");
            mailMessage.Attachments.Add(pdfAttachment);

            await smtpClient.SendMailAsync(mailMessage);

            // Update invoice email sent timestamp
            invoice.EmailSentAt = DateTime.UtcNow;
            invoice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Invoice {InvoiceNumber} email sent to {CustomerEmail} with PDF attachment", 
                invoice.Number, invoice.Customer.Email);

            return true;
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "Failed to send invoice email for {InvoiceNumber} to {CustomerEmail}", 
                invoice.Number, invoice.Customer.Email);
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }

    private async Task<byte[]> GeneratePdfAsync(string html)
    {
        await EnsureBrowserDownloadedAsync();

        await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox", "--disable-setuid-sandbox" }
        });

        await using var page = await browser.NewPageAsync();
        await page.SetContentAsync(html);
        
        var pdfBytes = await page.PdfDataAsync(new PdfOptions
        {
            Format = PaperFormat.A4,
            PrintBackground = true,
            MarginOptions = new MarginOptions
            {
                Top = "10mm",
                Bottom = "10mm",
                Left = "10mm",
                Right = "10mm"
            }
        });

        return pdfBytes;
    }

    private string BuildInvoicePdfHtml(Models.Invoice invoice, DTOs.CompanySettingsDto? companySettings)
    {
        const string goldColor = "#c9a227";
        
        var companyName = companySettings?.CompanyName ?? "SIYYAD KHAN TOURISM LLC";
        var companyAddress = companySettings?.Address ?? "1513, 15th floor, Tamani Art Building, Dubai, UAE";
        var companyPhone = companySettings?.Phone ?? "+971 55 752 3374";
        var companyEmail = companySettings?.Email ?? "info@skt.ae";
        var companyWebsite = companySettings?.Website ?? "www.skt.ae";
        var companyTRN = companySettings?.TRN ?? "104082040700003";

        // Get logo and signature as base64
        var logoHtml = !string.IsNullOrEmpty(companySettings?.LogoImageData)
            ? $@"<img src='{companySettings.LogoImageData}' alt='Company Logo' style='height: 70px; width: auto;' />"
            : "";

        var signatureHtml = !string.IsNullOrEmpty(companySettings?.ActiveSignature?.ImageData)
            ? $@"<img src='{companySettings.ActiveSignature.ImageData}' alt='Authorized Signature' style='height: 65px; width: auto; margin-bottom: 5px;' />"
            : "";

        // Build services rows - service rates are VAT-exclusive
        var servicesHtml = new StringBuilder();
        decimal servicesTotal = 0;
        foreach (var service in invoice.InvoiceServices)
        {
            var serviceCharge = service.Rate; // Service rates are VAT-exclusive
            servicesTotal += serviceCharge;
            servicesHtml.Append($@"
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{service.ServiceName}</td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>AED {serviceCharge:F2}</td>
                </tr>");
        }

        // VAT is calculated from bank payments only
        var vat = invoice.Payments.Sum(p => p.Vat);
        var subtotal = servicesTotal + vat;
        var statusText = invoice.Status.ToString();
        var balanceDue = invoice.Total - invoice.Paid;

        // Social media SVGs
        var instagramSvg = @"<svg width='14' height='14' viewBox='0 0 24 24' fill='#E4405F'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/></svg>";
        var whatsappSvg = @"<svg width='14' height='14' viewBox='0 0 24 24' fill='#25D366'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg>";
        var facebookSvg = @"<svg width='14' height='14' viewBox='0 0 24 24' fill='#1877F2'><path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/></svg>";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11pt; }}
        .container {{ max-width: 800px; margin: 0 auto; }}
        .gold {{ color: {goldColor}; }}
        .gold-bg {{ background-color: {goldColor}; color: white; }}
        table {{ border-collapse: collapse; width: 100%; }}
        .policy-box {{ background-color: #fff9e6; border: 1px solid {goldColor}; border-radius: 4px; padding: 12px; }}
        .social-link {{ display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 9pt; margin: 0 8px; }}
    </style>
</head>
<body>
    <div class='container'>
        <!-- Header -->
        <table style='margin-bottom: 15px; border-bottom: 3px solid {goldColor}; padding-bottom: 15px;'>
            <tr>
                <td style='vertical-align: top; width: 60%;'>
                    {logoHtml}
                    <h2 style='color: {goldColor}; margin: 10px 0 5px 0;'>{companyName}</h2>
                    <p style='color: #666; font-size: 10pt; margin: 2px 0;'>{companyAddress}</p>
                    <p style='color: #666; font-size: 10pt; margin: 2px 0;'>Mob: {companyPhone}</p>
                    <p style='color: #666; font-size: 10pt; margin: 2px 0;'>Email: {companyEmail} | Website: {companyWebsite}</p>
                    <p style='font-size: 10pt; margin: 5px 0; font-weight: bold;'>TRN: {companyTRN}</p>
                </td>
                <td style='text-align: right; vertical-align: top;'>
                    <p style='color: #666; font-size: 10pt; font-weight: bold; margin: 0;'>INVOICE</p>
                    <h3 style='color: {goldColor}; margin: 5px 0;'>{invoice.Number}</h3>
                    <p style='font-size: 10pt; margin: 0;'>Date: {invoice.Date:dd/MM/yyyy}</p>
                    <div style='margin-top: 10px;'>
                        <span style='color: #E4405F;'>{instagramSvg}</span>
                        <span style='color: #25D366; margin-left: 8px;'>{whatsappSvg}</span>
                        <span style='color: #1877F2; margin-left: 8px;'>{facebookSvg}</span>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Customer & Driver Info -->
        <table style='margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 15px;'>
            <tr>
                <td style='vertical-align: top; width: 50%;'>
                    <p style='color: {goldColor}; font-weight: bold; margin: 0 0 5px 0;'>ISSUED TO:</p>
                    <p style='font-weight: bold; margin: 0;'>{invoice.Customer.Name}</p>
                    <p style='color: #666; font-size: 10pt; margin: 3px 0;'>Guests: <strong>{invoice.Adults}</strong> adult(s), <strong>{invoice.Children}</strong> child(ren)</p>
                    <p style='color: #666; font-size: 10pt; margin: 3px 0;'>Trip Type: <strong>{invoice.TripType}</strong></p>
                    <p style='color: #666; font-size: 10pt; margin: 3px 0;'>Trip Mode: <strong>{invoice.TripMode}</strong></p>
                </td>
                <td style='text-align: right; vertical-align: top;'>
                    <p style='color: {goldColor}; font-weight: bold; margin: 0 0 5px 0;'>DRIVER:</p>
                    <p style='margin: 0;'>{invoice.Driver?.Name ?? "Not assigned"}</p>
                    {(!string.IsNullOrEmpty(invoice.Driver?.Phone) ? $"<p style='color: #666; font-size: 10pt; margin: 3px 0;'>Phone: <strong>{invoice.Driver.Phone}</strong></p>" : "")}
                    {(!string.IsNullOrEmpty(invoice.DriverNotes) ? $"<p style='color: #666; font-size: 9pt; margin: 3px 0; font-style: italic;'>Notes: {invoice.DriverNotes}</p>" : "")}
                </td>
            </tr>
        </table>

        <!-- Services Table -->
        <div style='margin-bottom: 15px;'>
            <p style='color: {goldColor}; font-weight: bold; margin: 0 0 10px 0;'>SERVICES</p>
            <table>
                <thead>
                    <tr class='gold-bg'>
                        <th style='padding: 8px; text-align: left;'>Description</th>
                        <th style='padding: 8px; text-align: right; width: 30%;'>Service Charge</th>
                    </tr>
                </thead>
                <tbody>
                    {servicesHtml}
                </tbody>
                <tfoot>
                    <tr style='background-color: #f9f9f9;'>
                        <td style='padding: 8px; text-align: right; font-weight: bold;'>Service Total (excl. VAT):</td>
                        <td style='padding: 8px; text-align: right; font-weight: bold;'>AED {servicesTotal:F2}</td>
                    </tr>
                    <tr style='background-color: #f9f9f9;'>
                        <td style='padding: 8px; text-align: right; font-weight: bold;'>VAT (5% from payments):</td>
                        <td style='padding: 8px; text-align: right; font-weight: bold;'>AED {vat:F2}</td>
                    </tr>
                    <tr class='gold-bg'>
                        <td style='padding: 8px; text-align: right; font-weight: bold;'>Total (incl. VAT):</td>
                        <td style='padding: 8px; text-align: right; font-weight: bold;'>AED {subtotal:F2}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Payment Info & Signature -->
        <table style='margin-bottom: 15px; border-top: 1px solid #ddd; padding-top: 15px;'>
            <tr>
                <td style='vertical-align: top; width: 50%;'>
                    <p style='color: {goldColor}; font-weight: bold; margin: 0 0 10px 0;'>PAYMENT INFORMATION:</p>
                    <p style='font-size: 10pt; margin: 3px 0;'>Status: <strong>{statusText}</strong></p>
                    <p style='font-size: 10pt; margin: 3px 0;'>Amount Paid: AED {invoice.Paid:F2}</p>
                    <p style='font-size: 10pt; margin: 3px 0;'>Balance Due: <strong>AED {balanceDue:F2}</strong></p>
                </td>
                <td style='text-align: right; vertical-align: bottom;'>
                    {signatureHtml}
                    <div style='border-top: 1px solid {goldColor}; padding-top: 5px; width: 60%; margin-left: auto;'>
                        <p style='font-size: 10pt; margin: 0;'>Authorized Signature</p>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Policy Notice -->
        <div class='policy-box' style='margin-bottom: 15px;'>
            <table>
                <tr>
                    <td style='vertical-align: top; width: 50%;'>
                        <p style='color: {goldColor}; font-weight: bold; font-size: 10pt; margin: 0 0 3px 0;'>Cancellation Policy:</p>
                        <p style='color: #666; font-size: 9pt; margin: 0;'>No cancellations. Only rescheduling is allowed to the next available date.</p>
                    </td>
                    <td style='vertical-align: top;'>
                        <p style='color: {goldColor}; font-weight: bold; font-size: 10pt; margin: 0 0 3px 0;'>Card Payment Notice:</p>
                        <p style='color: #666; font-size: 9pt; margin: 0;'>A 5% Value-Added Charge applies to payments made via card.</p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style='text-align: center; border-top: 2px solid {goldColor}; padding-top: 15px;'>
            <p style='color: {goldColor}; font-weight: bold; margin: 0 0 10px 0;'>Thank you for choosing {companyName}!</p>
            <p style='font-size: 9pt; margin: 0;'>
                <span style='color: #E4405F;'>{instagramSvg} @sktuae</span>
                <span style='color: #25D366; margin-left: 15px;'>{whatsappSvg} {companyPhone}</span>
                <span style='color: #1877F2; margin-left: 15px;'>{facebookSvg} /sktuae</span>
            </p>
            <p style='color: #999; font-size: 8pt; margin-top: 10px;'>This is a computer-generated document.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string BuildEmailBodyHtml(Models.Invoice invoice, DTOs.CompanySettingsDto? companySettings, string fromName)
    {
        const string goldColor = "#c9a227";
        var companyName = companySettings?.CompanyName ?? fromName;
        var balanceDue = invoice.Total - invoice.Paid;
        var statusText = invoice.Status.ToString();

        // Use CID references for inline images
        var logoHtml = !string.IsNullOrEmpty(companySettings?.LogoImageData)
            ? @"<img src='cid:companylogo' alt='Company Logo' style='height: 60px; width: auto;' />"
            : "";

        var signatureHtml = !string.IsNullOrEmpty(companySettings?.ActiveSignature?.ImageData)
            ? @"<img src='cid:signature' alt='Authorized Signature' style='height: 50px; width: auto;' />"
            : "";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <!-- Header -->
        <div style='background-color: {goldColor}; padding: 20px; text-align: center;'>
            {logoHtml}
            <h1 style='color: white; margin: 10px 0 0 0; font-size: 24px;'>{companyName}</h1>
        </div>

        <!-- Content -->
        <div style='padding: 30px;'>
            <h2 style='color: #333; margin-top: 0;'>Invoice {invoice.Number}</h2>
            
            <p style='color: #666; font-size: 14px;'>Dear {invoice.Customer.Name},</p>
            
            <p style='color: #666; font-size: 14px;'>
                Please find attached your invoice for the services provided. Below is a summary:
            </p>

            <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                <tr style='background-color: #f9f9f9;'>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Invoice Number</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'>{invoice.Number}</td>
                </tr>
                <tr>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Date</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'>{invoice.Date:dd/MM/yyyy}</td>
                </tr>
                <tr style='background-color: #f9f9f9;'>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Total Amount</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'>AED {invoice.Total:F2}</td>
                </tr>
                <tr>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Amount Paid</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'>AED {invoice.Paid:F2}</td>
                </tr>
                <tr style='background-color: #f9f9f9;'>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Trip Type</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'>{invoice.TripType}</td>
                </tr>
                <tr>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Trip Mode</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'>{invoice.TripMode}</td>
                </tr>
                <tr style='background-color: {goldColor}; color: white;'>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>Balance Due</strong></td>
                    <td style='padding: 12px; border: 1px solid #ddd;'><strong>AED {balanceDue:F2}</strong></td>
                </tr>
            </table>

            <p style='color: #666; font-size: 14px;'>
                Status: <strong style='color: {(statusText == "Paid" ? "#28a745" : statusText == "Partial" ? "#ffc107" : "#dc3545")};'>{statusText}</strong>
            </p>

            <p style='color: #666; font-size: 14px;'>
                The full invoice with service details is attached as a PDF document.
            </p>

            <!-- Signature -->
            <div style='margin-top: 30px; text-align: right;'>
                {signatureHtml}
                <div style='border-top: 1px solid {goldColor}; width: 200px; margin-left: auto; padding-top: 5px;'>
                    <p style='margin: 0; font-size: 12px; color: #666;'>Authorized Signature</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 2px solid {goldColor};'>
            <p style='color: {goldColor}; font-weight: bold; margin: 0 0 10px 0;'>Thank you for choosing {companyName}!</p>
            <p style='color: #666; font-size: 12px; margin: 0;'>
                {companySettings?.Phone ?? "+971 55 752 3374"} | {companySettings?.Email ?? "info@skt.ae"} | {companySettings?.Website ?? "www.skt.ae"}
            </p>
            <p style='color: #999; font-size: 10px; margin-top: 10px;'>This is an automated email. Please do not reply directly to this message.</p>
        </div>
    </div>
</body>
</html>";
    }
}
