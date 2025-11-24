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

        // Seed initial data if needed
        if (!context.Accounts.Any())
        {
            context.Accounts.AddRange(
                new Account { Name = "Cash Account", AccountNumber = "N/A", AccountType = "cash", Details = "Cash on hand" },
                new Account { Name = "Bank Account - HBL", AccountNumber = "1234567890", AccountType = "bank", Details = "Current Account" },
                new Account { Name = "Bank Account - MCB", AccountNumber = "0987654321", AccountType = "bank", Details = "Current Account" },
                new Account { Name = "Credit Card", AccountNumber = "1122334455", AccountType = "bank", Details = "Company Credit Card" }
            );
            await context.SaveChangesAsync();
        }

        if (!context.ExpenseTypes.Any())
        {
            context.ExpenseTypes.AddRange(
                new ExpenseType { Name = "Fuel", DefaultValue = 500 },
                new ExpenseType { Name = "Tolls", DefaultValue = 50 },
                new ExpenseType { Name = "Parking", DefaultValue = 30 },
                new ExpenseType { Name = "Tickets", DefaultValue = 100 },
                new ExpenseType { Name = "Maintenance", DefaultValue = 200 }
            );
            await context.SaveChangesAsync();
        }
    }
}

