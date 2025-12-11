/**
 * Unified Invoice Print Utility
 * Used by both OpenInvoices and ClosedInvoices pages
 */

// SVG icons for social media
const instagramSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;

const whatsappSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

const facebookSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

const GOLD_COLOR = '#c9a227';

/**
 * Calculate total VAT for an invoice (5% VAT extracted from VAT-inclusive prices)
 */
export const calculateInvoiceVAT = (invoice) => {
    // Extract 5% VAT from each service
    const serviceVAT = invoice.services.reduce((sum, service) => {
        const rate = parseFloat(service.rate) || 0;
        return sum + (rate * 0.05 / 1.05); // Extract VAT from VAT-included price
    }, 0);

    // Add payment VAT if present
    const paymentVAT = invoice.payments.reduce((sum, payment) => {
        return sum + (payment.vat || 0);
    }, 0);

    return serviceVAT + paymentVAT;
};

/**
 * Get driver contact from drivers list
 */
const getDriverContactHTML = (invoice, drivers) => {
    if (!invoice.driver || !drivers) return '';
    const driver = drivers.find(d => d.name === invoice.driver);
    return driver ? `<p class="mb-0 text-muted" style="font-size: 11pt">Contact: ${driver.phone}</p>` : '';
};

/**
 * Get trip type and trip mode badges HTML
 */
const getTripInfoHTML = (invoice) => {
    if (!invoice.tripType && !invoice.tripMode) return '';
    
    const badges = [];
    
    if (invoice.tripType) {
        const isNight = invoice.tripType === 'Evening';
        const badgeStyle = isNight 
            ? 'background-color: #333; color: #fff;' 
            : 'background-color: #FFA500; color: #000;';
        const icon = isNight ? '🌙' : '☀️';
        badges.push(`<span class="badge" style="${badgeStyle} font-size: 12px; padding: 4px 10px;">${icon} ${invoice.tripType}</span>`);
    }
    
    if (invoice.tripMode) {
        const isPrivate = invoice.tripMode === 'Private';
        const badgeStyle = isPrivate 
            ? 'background-color: #007bff; color: #fff;' 
            : 'background-color: #6c757d; color: #fff;';
        badges.push(`<span class="badge" style="${badgeStyle} font-size: 12px; padding: 4px 10px;">${invoice.tripMode}</span>`);
    }
    
    return badges.length > 0 
        ? `<div class="d-flex gap-2 align-items-center mt-1">${badges.join('')}</div>` 
        : '';
};

/**
 * Generate service rows HTML
 */
const getServiceRowsHTML = (invoice) => {
    if (!invoice.services || !invoice.services.length) {
        return '<tr><td colspan="2" class="text-center">No services added</td></tr>';
    }

    return invoice.services.map(service => {
        const rateWithVat = parseFloat(service.rate) || 0;
        const serviceCharge = rateWithVat / 1.05; // Extract base amount

        return `<tr>
            <td>${service.service}</td>
            <td class="text-end">AED ${serviceCharge.toFixed(2)}</td>
        </tr>`;
    }).join('');
};

/**
 * Generate invoice totals HTML for the footer
 */
const getInvoiceTotalsHTML = (invoice) => {
    if (!invoice.services || !invoice.services.length) return '';

    const total = invoice.services.reduce((sum, s) => sum + parseFloat(s.rate || 0), 0);
    const vat = calculateInvoiceVAT(invoice);
    const subtotal = total - vat;

    return `
        <tr class="table-light">
            <td class="text-end fw-medium">Service Total:</td>
            <td class="text-end fw-medium">AED ${subtotal.toFixed(2)}</td>
        </tr>
        <tr class="table-light">
            <td class="text-end fw-medium">VAT (5%):</td>
            <td class="text-end fw-medium">AED ${vat.toFixed(2)}</td>
        </tr>
        <tr class="gold-bg">
            <td class="text-end fw-bold">Total:</td>
            <td class="text-end fw-bold">AED ${total.toFixed(2)}</td>
        </tr>
    `;
};

/**
 * Print an invoice using iframe technique
 * @param {Object} invoice - The invoice object to print
 * @param {Object} options - Print options
 * @param {Object} options.companySettings - Company settings from context
 * @param {Array} options.drivers - Drivers list for contact info
 * @param {string} options.defaultLogoSrc - Default logo source if no company logo
 */
export const printInvoice = (invoice, options = {}) => {
    const { companySettings, drivers, defaultLogoSrc } = options;

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Get access to the iframe document
    const iframeDoc = iframe.contentWindow.document;

    // Get dynamic logo and signature from company settings
    const logoSrc = companySettings?.logoImageData || defaultLogoSrc || '';
    const signatureData = companySettings?.activeSignature?.imageData;
    const companyName = companySettings?.companyName || 'SIYYAD KHAN TOURISM LLC';
    const companyAddress = companySettings?.address || '1513, 15th floor, Tamani Art Building, Dubai, UAE';
    const companyPhone = companySettings?.phone || '+971 55 752 3374';
    const companyEmail = companySettings?.email || 'info@skt.ae';
    const companyWebsite = companySettings?.website || 'www.skt.ae';
    const companyTRN = companySettings?.trn || '104082040700003';

    // Build signature HTML with error handling
    const signatureHTML = signatureData 
        ? `<img src="${signatureData}" alt="Authorized Signature" style="height: 85px; width: auto; margin-bottom: 5px;" onerror="this.style.display='none'" />`
        : '';

    // Get driver contact HTML
    const driverContactHTML = getDriverContactHTML(invoice, drivers);

    // Driver notes HTML
    const driverNotesHTML = invoice.driverNotes 
        ? `<p class="mb-0 text-muted" style="font-size: 10pt"><em>Notes: ${invoice.driverNotes}</em></p>` 
        : '';

    // Trip info HTML (tripType and tripMode)
    const tripInfoHTML = getTripInfoHTML(invoice);

    // Payment status info
    const isPaid = invoice.status === 'paid';
    const statusText = isPaid ? 'Paid' : (invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid');
    const balanceDue = isPaid ? 0 : (invoice.total - invoice.paid);

    // Write the HTML content to the iframe
    iframeDoc.write(`<!DOCTYPE html>
    <html>
    <head>
        <title>${invoice.number}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <style>
            @media print {
                body { padding: 17px; font-size: 11pt; }
                @page { size: A4; margin: 8mm; }
                .container { padding: 0 !important; max-width: 100%; }
                .table { margin-bottom: 11px; }
                .gold { color: ${GOLD_COLOR}; }
                .gold-bg { background-color: ${GOLD_COLOR}; color: white; }
                a { text-decoration: none !important; }
            }
            .gold { color: ${GOLD_COLOR}; }
            .gold-bg { background-color: ${GOLD_COLOR}; color: white; }
            .policy-box { background-color: #fff9e6; border: 1px solid ${GOLD_COLOR}; border-radius: 4px; padding: 9px; font-size: 10pt; }
            .social-link { display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 10pt; margin: 0 9px; }
        </style>
    </head>
    <body>
        <div class="container p-2">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom" style="border-color: ${GOLD_COLOR}">
                <div class="d-flex align-items-start gap-3">
                    <img src="${logoSrc}" alt="Company Logo" style="height: 77px; width: auto;" onerror="this.style.display='none'"/>
                    <div>
                    <h5 class="fw-bold mb-1 gold">${companyName}</h5>
                    <p class="mb-0 text-muted" style="font-size: 11pt">${companyAddress}</p>
                    <p class="mb-0 text-muted" style="font-size: 11pt">Mob: ${companyPhone}</p>
                    <p class="mb-0 text-muted" style="font-size: 11pt">Email: ${companyEmail} | Website: ${companyWebsite}</p>
                    <p class="mb-0 fw-medium" style="font-size: 11pt">TRN: ${companyTRN}</p>
                    </div>
                </div>
                <div class="text-end">
                    <p class="fw-bold text-muted mb-1" style="font-size: 11pt">INVOICE</p>
                    <h5 class="fw-bold gold mb-1">${invoice.number}</h5>
                    <p class="mb-0" style="font-size: 11pt">Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                    <div class="mt-2">
                        <a href="https://www.instagram.com/sktuae/" class="social-link" style="color: #E4405F">${instagramSvg}</a>
                        <a href="https://api.whatsapp.com/send/?phone=971557523374" class="social-link" style="color: #25D366">${whatsappSvg}</a>
                        <a href="https://www.facebook.com/sktuae" class="social-link" style="color: #1877F2">${facebookSvg}</a>
                    </div>
                </div>
            </div>
            
            <!-- Customer & Driver -->
            <div class="row g-0 mb-3 pb-2 border-bottom">
                <div class="col-6">
                    <p class="fw-bold mb-1 gold" style="font-size: 12pt">ISSUED TO:</p>
                    <p class="mb-1 fw-medium" style="font-size: 14pt">${invoice.customer}</p>
                    <p class="mb-1 text-muted" style="font-size: 11pt">Guests: <strong>${invoice.adults ?? 0}</strong> adult(s), <strong>${invoice.children ?? 0}</strong> child(ren)</p>
                    ${tripInfoHTML}
                </div>
                <div class="col-6 text-end">
                    <p class="fw-bold mb-1 gold" style="font-size: 12pt">DRIVER:</p>
                    <p class="mb-1" style="font-size: 14pt">${invoice.driver || "Not assigned"}</p>
                    ${driverContactHTML}
                    ${driverNotesHTML}
                </div>
            </div>
            
            <!-- Services -->
            <div class="mb-3">
                <p class="fw-bold mb-2 gold" style="font-size: 12pt">SERVICES</p>
                <table class="table table-bordered table-sm" style="font-size: 11pt">
                    <thead class="gold-bg">
                        <tr>
                            <th>Description</th>
                            <th class="text-end" style="width:30%">Service Charge</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${getServiceRowsHTML(invoice)}
                    </tbody>
                    <tfoot>
                        ${getInvoiceTotalsHTML(invoice)}
                    </tfoot>
                </table>
            </div>

            <!-- Payment Info -->
            <div class="row g-0 mb-3 pt-2 border-top">
                <div class="col-6">
                    <p class="fw-bold mb-2 gold" style="font-size: 12pt">PAYMENT INFORMATION:</p>
                    <p class="mb-0" style="font-size: 11pt">Status: <strong>${statusText}</strong></p>
                    <p class="mb-0" style="font-size: 11pt">Amount Paid: AED ${invoice.paid.toFixed(2)}</p>
                    <p class="mb-0" style="font-size: 11pt">Balance Due: <strong>AED ${balanceDue.toFixed(2)}</strong></p>
                </div>
                <div class="col-6 text-end">
                    <div class="mt-3 pt-3">
                        ${signatureHTML}
                        <div class="border-top pt-1 w-75 ms-auto" style="border-color: ${GOLD_COLOR}">
                            <p class="mb-0" style="font-size: 11pt">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Policy Notice -->
            <div class="policy-box mb-3">
                <div class="row">
                    <div class="col-6">
                        <p class="mb-1 fw-bold gold">Cancellation Policy:</p>
                        <p class="mb-0 text-muted">No cancellations. Only rescheduling is allowed to the next available date.</p>
                    </div>
                    <div class="col-6">
                        <p class="mb-1 fw-bold gold">Card Payment Notice:</p>
                        <p class="mb-0 text-muted">A 5% Value-Added Charge applies to payments made via card.</p>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="text-center pt-2 border-top" style="border-color: ${GOLD_COLOR}">
                <p class="mb-1 fw-bold gold">Thank you for choosing ${companyName}!</p>
                <div class="mb-1">
                    <a href="https://www.instagram.com/sktuae/" class="social-link" style="color: #E4405F">${instagramSvg} @sktuae</a>
                    <a href="https://api.whatsapp.com/send/?phone=971557523374" class="social-link" style="color: #25D366">${whatsappSvg} ${companyPhone}</a>
                    <a href="https://www.facebook.com/sktuae" class="social-link" style="color: #1877F2">${facebookSvg} /sktuae</a>
                </div>
                <p class="mb-0 text-muted" style="font-size: 10pt">This is a computer-generated document.</p>
            </div>
        </div>
    </body>
    </html>`);

    iframeDoc.close();

    // Wait for the iframe content to load
    iframe.onload = function () {
        try {
            // Print the iframe content
            iframe.contentWindow.print();

            // Remove the iframe after printing (with a delay to ensure printing completes)
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        } catch (e) {
            console.error('Print failed', e);
            document.body.removeChild(iframe);
        }
    };
};

export default printInvoice;

