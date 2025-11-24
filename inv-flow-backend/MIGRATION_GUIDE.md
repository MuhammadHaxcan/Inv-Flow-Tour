# Database Migration Guide

## Migration Created Successfully! ✅

The initial migration `InitialCreate` has been created in the `Migrations` folder.

## Files Created

- `Migrations/20251124005537_InitialCreate.cs` - The migration file containing all table creation scripts
- `Migrations/20251124005537_InitialCreate.Designer.cs` - Designer file for the migration
- `Migrations/ApplicationDbContextModelSnapshot.cs` - Snapshot of the current model state

## Applying the Migration

### Option 1: Automatic (Recommended)
The application will automatically apply migrations on startup. Just run:
```bash
dotnet run
```

### Option 2: Manual Application
To manually apply the migration using EF Core tools:

```bash
cd inv-flow-backend
dotnet ef database update
```

This will:
1. Connect to your PostgreSQL database (configured in `appsettings.json`)
2. Create all tables defined in the migration
3. Apply any constraints, indexes, and relationships

## Verifying the Migration

After applying the migration, you can verify it was successful by:

1. **Check the database:**
   ```sql
   -- Connect to PostgreSQL and run:
   \dt  -- List all tables
   ```

2. **Check migration history:**
   ```bash
   dotnet ef migrations list
   ```

3. **Verify in the application:**
   - Start the application
   - The seed data should be automatically populated
   - Default admin user: `admin` / `admin123`

## Creating New Migrations

When you make changes to your models, create a new migration:

```bash
cd inv-flow-backend
dotnet ef migrations add MigrationName
```

Then apply it:
```bash
dotnet ef database update
```

## Rolling Back Migrations

To rollback the last migration:
```bash
dotnet ef database update PreviousMigrationName
```

To remove the last migration (before applying):
```bash
dotnet ef migrations remove
```

## Migration Commands Reference

| Command | Description |
|---------|-------------|
| `dotnet ef migrations add <Name>` | Create a new migration |
| `dotnet ef migrations list` | List all migrations |
| `dotnet ef migrations remove` | Remove the last migration |
| `dotnet ef database update` | Apply pending migrations |
| `dotnet ef database update <MigrationName>` | Update to a specific migration |
| `dotnet ef migrations script` | Generate SQL script for migrations |

## Troubleshooting

### Connection String Issues
Make sure your `appsettings.json` has the correct PostgreSQL connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=invflow;Username=postgres;Password=your_password"
}
```

### Database Doesn't Exist
Create the database first:
```sql
CREATE DATABASE invflow;
```

### Migration Already Applied
If you see "No pending migrations", the migration has already been applied. Check your database tables.

### Reset Database (Development Only)
⚠️ **Warning: This will delete all data!**
```bash
dotnet ef database drop
dotnet ef database update
```

## What the Migration Creates

The `InitialCreate` migration creates the following tables:

1. **Accounts** - Financial accounts (cash, bank, credit card)
2. **Customers** - Customer information
3. **Drivers** - Driver information
4. **Services** - Available services
5. **ExpenseTypes** - Types of expenses
6. **Invoices** - Invoice records
7. **InvoiceServices** - Services linked to invoices
8. **InvoiceExpenses** - Expenses linked to invoices
9. **Payments** - Payment records
10. **Transactions** - Financial transactions
11. **Users** - User accounts
12. **Roles** - User roles
13. **Permissions** - System permissions
14. **UserRoles** - Many-to-many: Users ↔ Roles
15. **RolePermissions** - Many-to-many: Roles ↔ Permissions

All relationships, indexes, and constraints are included in the migration.

