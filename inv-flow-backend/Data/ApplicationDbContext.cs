using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using inv_flow_backend.Models;

namespace inv_flow_backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<ExpenseType> ExpenseTypes { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceServiceItem> InvoiceServices { get; set; }
    public DbSet<InvoiceExpense> InvoiceExpenses { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure DateOnly to map to PostgreSQL 'date' type (not timestamp)
        // This is the proper way - DateOnly maps directly to PostgreSQL 'date' type
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateOnly))
                {
                    property.SetColumnType("date");
                }
                else if (property.ClrType == typeof(DateOnly?))
                {
                    property.SetColumnType("date");
                }
            }
        }

        // Configure relationships
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Customer)
            .WithMany(c => c.Invoices)
            .HasForeignKey(i => i.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Driver)
            .WithMany(d => d.Invoices)
            .HasForeignKey(i => i.DriverId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<InvoiceServiceItem>()
            .HasOne(isr => isr.Invoice)
            .WithMany(i => i.InvoiceServices)
            .HasForeignKey(isr => isr.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InvoiceServiceItem>()
            .HasOne(isr => isr.Service)
            .WithMany(s => s.InvoiceServices)
            .HasForeignKey(isr => isr.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InvoiceExpense>()
            .HasOne(ie => ie.Invoice)
            .WithMany(i => i.InvoiceExpenses)
            .HasForeignKey(ie => ie.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InvoiceExpense>()
            .HasOne(ie => ie.ExpenseType)
            .WithMany(et => et.InvoiceExpenses)
            .HasForeignKey(ie => ie.ExpenseTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InvoiceExpense>()
            .HasOne(ie => ie.Vendor)
            .WithMany(v => v.InvoiceExpenses)
            .HasForeignKey(ie => ie.VendorId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Invoice)
            .WithMany(i => i.Payments)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Account)
            .WithMany(a => a.Payments)
            .HasForeignKey(p => p.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Invoice)
            .WithMany(i => i.Transactions)
            .HasForeignKey(t => t.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraints
        modelBuilder.Entity<Invoice>()
            .HasIndex(i => i.Number)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique();

        modelBuilder.Entity<Permission>()
            .HasIndex(p => p.Name)
            .IsUnique();
    }
}

