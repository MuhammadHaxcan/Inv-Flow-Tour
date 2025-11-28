using inv_flow_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace inv_flow_backend.Data;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed Permissions - always ensure they exist
        var permissionDefinitions = new[]
        {
            // Customer permissions
            ("customers.read", "Read customers", "customers", "read"),
            ("customers.write", "Create/Update customers", "customers", "write"),
            ("customers.delete", "Delete customers", "customers", "delete"),
            // Driver permissions
            ("drivers.read", "Read drivers", "drivers", "read"),
            ("drivers.write", "Create/Update drivers", "drivers", "write"),
            ("drivers.delete", "Delete drivers", "drivers", "delete"),
            // Service permissions
            ("services.read", "Read services", "services", "read"),
            ("services.write", "Create/Update services", "services", "write"),
            ("services.delete", "Delete services", "services", "delete"),
            // Account permissions
            ("accounts.read", "Read accounts", "accounts", "read"),
            ("accounts.write", "Create/Update accounts", "accounts", "write"),
            ("accounts.delete", "Delete accounts", "accounts", "delete"),
            // Expense type permissions (used for expense types management)
            ("expenses.read", "Read expense types", "expenses", "read"),
            ("expenses.write", "Create/Update expense types", "expenses", "write"),
            ("expenses.delete", "Delete expense types", "expenses", "delete"),
            // Vendor permissions
            ("vendors.read", "Read vendors", "vendors", "read"),
            ("vendors.write", "Create/Update vendors", "vendors", "write"),
            ("vendors.delete", "Delete vendors", "vendors", "delete"),
            // Invoice permissions
            ("invoices.read", "Read invoices", "invoices", "read"),
            ("invoices.write", "Create/Update invoices", "invoices", "write"),
            ("invoices.delete", "Delete invoices", "invoices", "delete"),
            // Closed invoice permissions
            ("closedinvoices.read", "Read closed invoices", "closedinvoices", "read"),
            // Transaction permissions
            ("transactions.read", "Read transactions", "transactions", "read"),
            // Report permissions
            ("reports.read", "Read/view reports", "reports", "read"),
            ("reports.write", "Update/generate reports", "reports", "write"),
            // User permissions
            ("users.read", "Read users", "users", "read"),
            ("users.write", "Create/Update users", "users", "write"),
            ("users.delete", "Delete users", "users", "delete"),
            // Role permissions
            ("roles.read", "Read roles", "roles", "read"),
            ("roles.write", "Create/Update roles", "roles", "write"),
            ("roles.delete", "Delete roles", "roles", "delete"),
            // Permission permissions
            ("permissions.read", "Read permissions", "permissions", "read"),
            // Signature permissions
            ("signatures.read", "Read signatures", "signatures", "read"),
            ("signatures.write", "Create/Update signatures", "signatures", "write"),
            ("signatures.delete", "Delete signatures", "signatures", "delete"),
            // Company settings permissions
            ("companysettings.read", "Read company settings", "companysettings", "read"),
            ("companysettings.write", "Update company settings", "companysettings", "write")
        };

        foreach (var (name, description, resource, action) in permissionDefinitions)
        {
            if (!await context.Permissions.AnyAsync(p => p.Name == name))
            {
                context.Permissions.Add(new Permission
                {
                    Name = name,
                    Description = description,
                    Resource = resource,
                    Action = action
                });
            }
        }
        await context.SaveChangesAsync();

        // Seed Roles - always ensure they exist
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (adminRole == null)
        {
            adminRole = new Role { Name = "Admin", Description = "Administrator with full access" };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
        }

        var userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            userRole = new Role { Name = "User", Description = "Standard user" };
            context.Roles.Add(userRole);
            await context.SaveChangesAsync();
        }

        var managerRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Manager");
        if (managerRole == null)
        {
            managerRole = new Role { Name = "Manager", Description = "Manager with elevated permissions" };
            context.Roles.Add(managerRole);
            await context.SaveChangesAsync();
        }

        // Ensure Admin has ALL permissions
        var allPermissions = await context.Permissions.ToListAsync();
        var existingAdminPermissions = await context.RolePermissions
            .Where(rp => rp.RoleId == adminRole.Id)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        foreach (var permission in allPermissions)
        {
            if (!existingAdminPermissions.Contains(permission.Id))
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id
                });
            }
        }
        await context.SaveChangesAsync();

        // Ensure Manager has most permissions (except user/role delete)
        var existingManagerPermissions = await context.RolePermissions
            .Where(rp => rp.RoleId == managerRole.Id)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        var managerPermissions = allPermissions.Where(p =>
            !p.Name.Contains("users.delete") &&
            !p.Name.Contains("roles.delete"));

        foreach (var permission in managerPermissions)
        {
            if (!existingManagerPermissions.Contains(permission.Id))
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = managerRole.Id,
                    PermissionId = permission.Id
                });
            }
        }
        await context.SaveChangesAsync();

        // Ensure User has basic permissions
        var existingUserPermissions = await context.RolePermissions
            .Where(rp => rp.RoleId == userRole.Id)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        var basicUserPermissions = allPermissions.Where(p =>
            p.Name.Contains(".read") ||
            p.Name == "invoices.write" ||
            p.Name == "customers.write" ||
            p.Name == "reports.read" ||
            p.Name == "closedinvoices.read");

        foreach (var permission in basicUserPermissions)
        {
            if (!existingUserPermissions.Contains(permission.Id))
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = userRole.Id,
                    PermissionId = permission.Id
                });
            }
        }
        await context.SaveChangesAsync();

        // Seed default admin user if no users exist
        if (!await context.Users.AnyAsync())
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

            context.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });
            await context.SaveChangesAsync();
        }
        else
        {
            // Ensure admin user has admin role if they exist
            var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (adminUser != null)
            {
                var hasAdminRole = await context.UserRoles
                    .AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id);

                if (!hasAdminRole)
                {
                    context.UserRoles.Add(new UserRole
                    {
                        UserId = adminUser.Id,
                        RoleId = adminRole.Id
                    });
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
