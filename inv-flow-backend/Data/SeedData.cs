using inv_flow_backend.Models;

namespace inv_flow_backend.Data;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed Permissions
        if (!context.Permissions.Any())
        {
            var permissions = new[]
            {
                new Permission { Name = "customers.read", Description = "Read customers", Resource = "customers", Action = "read" },
                new Permission { Name = "customers.write", Description = "Create/Update customers", Resource = "customers", Action = "write" },
                new Permission { Name = "customers.delete", Description = "Delete customers", Resource = "customers", Action = "delete" },
                new Permission { Name = "drivers.read", Description = "Read drivers", Resource = "drivers", Action = "read" },
                new Permission { Name = "drivers.write", Description = "Create/Update drivers", Resource = "drivers", Action = "write" },
                new Permission { Name = "drivers.delete", Description = "Delete drivers", Resource = "drivers", Action = "delete" },
                new Permission { Name = "services.read", Description = "Read services", Resource = "services", Action = "read" },
                new Permission { Name = "services.write", Description = "Create/Update services", Resource = "services", Action = "write" },
                new Permission { Name = "services.delete", Description = "Delete services", Resource = "services", Action = "delete" },
                new Permission { Name = "accounts.read", Description = "Read accounts", Resource = "accounts", Action = "read" },
                new Permission { Name = "accounts.write", Description = "Create/Update accounts", Resource = "accounts", Action = "write" },
                new Permission { Name = "accounts.delete", Description = "Delete accounts", Resource = "accounts", Action = "delete" },
                new Permission { Name = "expenses.read", Description = "Read expenses", Resource = "expenses", Action = "read" },
                new Permission { Name = "expenses.write", Description = "Create/Update expenses", Resource = "expenses", Action = "write" },
                new Permission { Name = "expenses.delete", Description = "Delete expenses", Resource = "expenses", Action = "delete" },
                new Permission { Name = "vendors.read", Description = "Read vendors", Resource = "vendors", Action = "read" },
                new Permission { Name = "vendors.write", Description = "Create/Update vendors", Resource = "vendors", Action = "write" },
                new Permission { Name = "vendors.delete", Description = "Delete vendors", Resource = "vendors", Action = "delete" },
                new Permission { Name = "invoices.read", Description = "Read invoices", Resource = "invoices", Action = "read" },
                new Permission { Name = "invoices.write", Description = "Create/Update invoices", Resource = "invoices", Action = "write" },
                new Permission { Name = "invoices.delete", Description = "Delete invoices", Resource = "invoices", Action = "delete" },
                new Permission { Name = "transactions.read", Description = "Read transactions", Resource = "transactions", Action = "read" },
                new Permission { Name = "users.read", Description = "Read users", Resource = "users", Action = "read" },
                new Permission { Name = "users.write", Description = "Create/Update users", Resource = "users", Action = "write" },
                new Permission { Name = "users.delete", Description = "Delete users", Resource = "users", Action = "delete" },
                new Permission { Name = "roles.read", Description = "Read roles", Resource = "roles", Action = "read" },
                new Permission { Name = "roles.write", Description = "Create/Update roles", Resource = "roles", Action = "write" },
                new Permission { Name = "roles.delete", Description = "Delete roles", Resource = "roles", Action = "delete" },
                new Permission { Name = "permissions.read", Description = "Read permissions", Resource = "permissions", Action = "read" }
            };

            context.Permissions.AddRange(permissions);
            await context.SaveChangesAsync();
        }

        // Seed Roles
        if (!context.Roles.Any())
        {
            var adminRole = new Role { Name = "Admin", Description = "Administrator with full access" };
            var userRole = new Role { Name = "User", Description = "Standard user" };
            var managerRole = new Role { Name = "Manager", Description = "Manager with elevated permissions" };

            context.Roles.AddRange(adminRole, userRole, managerRole);
            await context.SaveChangesAsync();

            // Assign all permissions to Admin
            var allPermissions = context.Permissions.ToList();
            var adminRolePermissions = allPermissions.Select(p => new RolePermission
            {
                RoleId = adminRole.Id,
                PermissionId = p.Id
            });
            context.RolePermissions.AddRange(adminRolePermissions);

            // Assign basic permissions to User
            var userPermissions = allPermissions.Where(p =>
                p.Name.Contains(".read") ||
                (p.Name.Contains("invoices.write") && !p.Name.Contains("delete")) ||
                (p.Name.Contains("customers.write") && !p.Name.Contains("delete"))
            ).Select(p => new RolePermission
            {
                RoleId = userRole.Id,
                PermissionId = p.Id
            });
            context.RolePermissions.AddRange(userPermissions);

            // Assign manager permissions
            var managerPermissions = allPermissions.Where(p =>
                !p.Name.Contains("users.delete") &&
                !p.Name.Contains("roles.delete")
            ).Select(p => new RolePermission
            {
                RoleId = managerRole.Id,
                PermissionId = p.Id
            });
            context.RolePermissions.AddRange(managerPermissions);

            await context.SaveChangesAsync();
        }

        // Seed default admin user
        if (!context.Users.Any())
        {
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@invflow.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FullName = "Administrator",
                IsActive = true
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            var adminRole = context.Roles.First(r => r.Name == "Admin");
            context.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });

            await context.SaveChangesAsync();
        }

        //// Seed initial data if needed
        //if (!context.Accounts.Any())
        //{
        //    context.Accounts.AddRange(
        //        new Account { Name = "Cash Account", AccountNumber = "N/A", AccountType = "cash", Details = "Cash on hand" },
        //        new Account { Name = "Bank Account - HBL", AccountNumber = "1234567890", AccountType = "bank", Details = "Current Account" },
        //        new Account { Name = "Bank Account - MCB", AccountNumber = "0987654321", AccountType = "bank", Details = "Current Account" },
        //        new Account { Name = "Credit Card", AccountNumber = "1122334455", AccountType = "bank", Details = "Company Credit Card" }
        //    );
        //    await context.SaveChangesAsync();
        //}

        //if (!context.ExpenseTypes.Any())
        //{
        //    context.ExpenseTypes.AddRange(
        //        new ExpenseType { Name = "Fuel", DefaultValue = 500 },
        //        new ExpenseType { Name = "Tolls", DefaultValue = 50 },
        //        new ExpenseType { Name = "Parking", DefaultValue = 30 },
        //        new ExpenseType { Name = "Tickets", DefaultValue = 100 },
        //        new ExpenseType { Name = "Maintenance", DefaultValue = 200 },
        //        new ExpenseType { Name = "Meals", DefaultValue = 150 },
        //        new ExpenseType { Name = "Accommodation", DefaultValue = 800 },
        //        new ExpenseType { Name = "Insurance", DefaultValue = 300 }
        //    );
        //    await context.SaveChangesAsync();
        //}

        //// Seed Customers
        //if (!context.Customers.Any())
        //{
        //    context.Customers.AddRange(
        //        new Customer { Name = "ABC Travel Agency", Phone = "+971-50-1234567", Email = "contact@abctravel.ae", Origin = "Dubai, UAE" },
        //        new Customer { Name = "XYZ Tourism LLC", Phone = "+971-50-2345678", Email = "info@xyztourism.ae", Origin = "Abu Dhabi, UAE" },
        //        new Customer { Name = "Desert Safari Tours", Phone = "+971-50-3456789", Email = "bookings@desertsafari.ae", Origin = "Sharjah, UAE" },
        //        new Customer { Name = "Luxury Travel Co.", Phone = "+971-50-4567890", Email = "sales@luxurytravel.ae", Origin = "Dubai, UAE" },
        //        new Customer { Name = "City Tours Express", Phone = "+971-50-5678901", Email = "hello@citytours.ae", Origin = "Dubai, UAE" },
        //        new Customer { Name = "Adventure Seekers", Phone = "+971-50-6789012", Email = "info@adventure.ae", Origin = "Ras Al Khaimah, UAE" },
        //        new Customer { Name = "Heritage Tours", Phone = "+971-50-7890123", Email = "contact@heritage.ae", Origin = "Fujairah, UAE" },
        //        new Customer { Name = "Corporate Travel Solutions", Phone = "+971-50-8901234", Email = "corporate@travel.ae", Origin = "Dubai, UAE" }
        //    );
        //    await context.SaveChangesAsync();
        //}

        // Seed Drivers
        //if (!context.Drivers.Any())
        //{
        //    context.Drivers.AddRange(
        //        new Driver { Name = "Ahmed Al Mansoori", Phone = "+971-50-1111111" },
        //        new Driver { Name = "Mohammed Hassan", Phone = "+971-50-2222222" },
        //        new Driver { Name = "Khalid Ibrahim", Phone = "+971-50-3333333" },
        //        new Driver { Name = "Omar Abdullah", Phone = "+971-50-4444444" },
        //        new Driver { Name = "Youssef Ali", Phone = "+971-50-5555555" },
        //        new Driver { Name = "Saeed Mohammed", Phone = "+971-50-6666666" }
        //    );
        //    await context.SaveChangesAsync();
        //}

        //// Seed Services
        //if (!context.Services.Any())
        //{
        //    context.Services.AddRange(
        //        new Service { Name = "City Tour - Half Day", Description = "4-hour city tour covering major attractions", Charge = 380.95m, VatIncluded = 400.00m },
        //        new Service { Name = "City Tour - Full Day", Description = "8-hour comprehensive city tour", Charge = 714.29m, VatIncluded = 750.00m },
        //        new Service { Name = "Desert Safari - Morning", Description = "Morning desert safari with dune bashing", Charge = 380.95m, VatIncluded = 400.00m },
        //        new Service { Name = "Desert Safari - Evening", Description = "Evening desert safari with BBQ dinner", Charge = 523.81m, VatIncluded = 550.00m },
        //        new Service { Name = "Burj Khalifa Visit", Description = "Visit to Burj Khalifa observation deck", Charge = 238.10m, VatIncluded = 250.00m },
        //        new Service { Name = "Dubai Marina Cruise", Description = "2-hour cruise in Dubai Marina", Charge = 380.95m, VatIncluded = 400.00m },
        //        new Service { Name = "Abu Dhabi Day Trip", Description = "Full day trip to Abu Dhabi", Charge = 714.29m, VatIncluded = 750.00m },
        //        new Service { Name = "Airport Transfer", Description = "One-way airport transfer", Charge = 190.48m, VatIncluded = 200.00m },
        //        new Service { Name = "VIP Tour Package", Description = "Premium VIP tour with luxury vehicle", Charge = 1428.57m, VatIncluded = 1500.00m },
        //        new Service { Name = "Cultural Heritage Tour", Description = "Tour of cultural and heritage sites", Charge = 476.19m, VatIncluded = 500.00m }
        //    );
        //    await context.SaveChangesAsync();
        //}

        //// Seed additional Users
        //if (context.Users.Count() == 1) // Only admin exists
        //{
        //    var managerRole = context.Roles.First(r => r.Name == "Manager");
        //    var userRole = context.Roles.First(r => r.Name == "User");

        //    var managerUser = new User
        //    {
        //        Username = "manager",
        //        Email = "manager@invflow.com",
        //        PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
        //        FullName = "Manager User",
        //        IsActive = true
        //    };

        //    var regularUser = new User
        //    {
        //        Username = "user",
        //        Email = "user@invflow.com",
        //        PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
        //        FullName = "Regular User",
        //        IsActive = true
        //    };

        //    context.Users.AddRange(managerUser, regularUser);
        //    await context.SaveChangesAsync();

        //    context.UserRoles.AddRange(
        //        new UserRole { UserId = managerUser.Id, RoleId = managerRole.Id },
        //        new UserRole { UserId = regularUser.Id, RoleId = userRole.Id }
        //    );

        //    await context.SaveChangesAsync();
        //}

        //// Seed Sample Invoices with related data
        //if (!context.Invoices.Any())
        //{
        //    var customers = context.Customers.ToList();
        //    var drivers = context.Drivers.ToList();
        //    var services = context.Services.ToList();
        //    var expenseTypes = context.ExpenseTypes.ToList();
        //    var accounts = context.Accounts.ToList();

        //    if (customers.Any() && services.Any() && accounts.Any())
        //    {
        //        var baseDate = DateTime.UtcNow.AddDays(-30);
        //        var invoiceNumber = 1000;

        //        // Create 10 sample invoices
        //        for (int i = 0; i < 10; i++)
        //        {
        //            var customer = customers[i % customers.Count];
        //            var driver = i % 3 == 0 ? null : drivers[i % drivers.Count]; // Some invoices without drivers
        //            var invoiceDate = baseDate.AddDays(i * 3);
        //            var persons = (i % 5) + 1; // 1-5 persons

        //            // Calculate totals
        //            var selectedServices = services.Take((i % 3) + 1).ToList(); // 1-3 services per invoice
        //            var serviceTotal = selectedServices.Sum(s => s.VatIncluded);
        //            var vatAmount = serviceTotal * 0.05m / 1.05m;

        //            // Add expenses for some invoices
        //            var hasExpenses = i % 2 == 0;
        //            var expenseTotal = 0m;
        //            if (hasExpenses && expenseTypes.Any())
        //            {
        //                var selectedExpenses = expenseTypes.Take((i % 2) + 1).ToList();
        //                expenseTotal = selectedExpenses.Sum(e => e.DefaultValue);
        //            }

        //            var invoiceTotal = serviceTotal - expenseTotal;
        //            var paidAmount = i < 3 ? invoiceTotal : (i < 6 ? invoiceTotal * 0.5m : 0m); // Some paid, some partial, some unpaid
        //            var status = paidAmount == 0 ? "unpaid" : (paidAmount < invoiceTotal ? "partial" : "paid");

        //            var invoice = new Invoice
        //            {
        //                Number = $"INV-{invoiceNumber + i}",
        //                Date = DateOnly.FromDateTime(invoiceDate),
        //                CustomerId = customer.Id,
        //                DriverId = driver?.Id,
        //                Persons = persons,
        //                Total = invoiceTotal,
        //                Paid = paidAmount,
        //                Status = status,
        //                Vat = vatAmount
        //            };

        //            context.Invoices.Add(invoice);
        //            await context.SaveChangesAsync();

        //            // Add invoice services
        //            foreach (var service in selectedServices)
        //            {
        //                context.InvoiceServices.Add(new InvoiceServiceItem
        //                {
        //                    InvoiceId = invoice.Id,
        //                    ServiceId = service.Id,
        //                    ServiceName = service.Name,
        //                    Rate = service.VatIncluded
        //                });
        //            }

        //            // Add invoice expenses
        //            if (hasExpenses && expenseTypes.Any())
        //            {
        //                var selectedExpenses = expenseTypes.Take((i % 2) + 1).ToList();
        //                foreach (var expenseType in selectedExpenses)
        //                {
        //                    context.InvoiceExpenses.Add(new InvoiceExpense
        //                    {
        //                        InvoiceId = invoice.Id,
        //                        ExpenseTypeId = expenseType.Id,
        //                        Type = expenseType.Name,
        //                        Amount = expenseType.DefaultValue,
        //                        Date = DateOnly.FromDateTime(invoiceDate.AddDays(-1))
        //                    });
        //                }
        //            }

        //            // Add payments for paid/partial invoices
        //            if (paidAmount > 0)
        //            {
        //                var bankAccount = accounts.First(a => a.AccountType == "bank");
        //                var paymentAmount = paidAmount;
        //                var paymentVat = bankAccount.AccountType == "bank" ? paymentAmount * 0.05m / 1.05m : 0m;

        //                var payment = new Payment
        //                {
        //                    InvoiceId = invoice.Id,
        //                    AccountId = bankAccount.Id,
        //                    Amount = paymentAmount,
        //                    Date = DateOnly.FromDateTime(invoiceDate.AddDays(1)),
        //                    Reference = $"PAY-{invoiceNumber + i}-001",
        //                    Vat = paymentVat,
        //                    Notes = $"Payment for invoice {invoice.Number}"
        //                };

        //                context.Payments.Add(payment);

        //                // Create transaction for payment
        //                context.Transactions.Add(new Transaction
        //                {
        //                    Date = payment.Date,
        //                    Description = $"Payment received for Invoice {invoice.Number}",
        //                    InvoiceId = invoice.Id,
        //                    InvoiceNumber = invoice.Number,
        //                    AccountId = bankAccount.Id,
        //                    Credit = paymentAmount,
        //                    Debit = 0,
        //                    Reference = payment.Reference,
        //                    Notes = payment.Notes
        //                });
        //            }

        //            // Create transaction for invoice creation (debit)
        //            var cashAccount = accounts.First(a => a.AccountType == "cash");
        //            context.Transactions.Add(new Transaction
        //            {
        //                Date = DateOnly.FromDateTime(invoiceDate),
        //                Description = $"Invoice {invoice.Number} - {customer.Name}",
        //                InvoiceId = invoice.Id,
        //                InvoiceNumber = invoice.Number,
        //                AccountId = cashAccount.Id,
        //                Credit = 0,
        //                Debit = invoiceTotal,
        //                Notes = $"Invoice for {persons} person(s)"
        //            });

        //            // Create transactions for expenses
        //            if (hasExpenses && expenseTypes.Any())
        //            {
        //                var selectedExpenses = expenseTypes.Take((i % 2) + 1).ToList();
        //                foreach (var expenseType in selectedExpenses)
        //                {
        //                    context.Transactions.Add(new Transaction
        //                    {
        //                        Date = DateOnly.FromDateTime(invoiceDate.AddDays(-1)),
        //                        Description = $"{expenseType.Name} expense for Invoice {invoice.Number}",
        //                        InvoiceId = invoice.Id,
        //                        InvoiceNumber = invoice.Number,
        //                        AccountId = cashAccount.Id,
        //                        Credit = 0,
        //                        Debit = expenseType.DefaultValue,
        //                        ExpenseType = expenseType.Name,
        //                        Notes = $"Expense related to invoice {invoice.Number}"
        //                    });
        //                }
        //            }
        //        }

        await context.SaveChangesAsync();
    }
}
