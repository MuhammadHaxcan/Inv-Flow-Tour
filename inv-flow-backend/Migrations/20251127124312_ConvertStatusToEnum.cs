using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace inv_flow_backend.Migrations
{
    /// <inheritdoc />
    public partial class ConvertStatusToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, add a temporary column for the new integer status
            migrationBuilder.AddColumn<int>(
                name: "StatusTemp",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Convert existing string values to integer values
            // InvoiceStatus: Unpaid = 0, Partial = 1, Paid = 2
            migrationBuilder.Sql(@"
                UPDATE ""Invoices"" 
                SET ""StatusTemp"" = CASE 
                    WHEN ""Status"" = 'paid' THEN 2
                    WHEN ""Status"" = 'partial' THEN 1
                    ELSE 0
                END;
            ");

            // Drop the old Status column
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Invoices");

            // Rename StatusTemp to Status
            migrationBuilder.RenameColumn(
                name: "StatusTemp",
                table: "Invoices",
                newName: "Status");

            // Do the same for InvoiceExpenses.PaymentStatus
            migrationBuilder.AddColumn<int>(
                name: "PaymentStatusTemp",
                table: "InvoiceExpenses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Convert existing string values to integer values
            // ExpensePaymentStatus: Unpaid = 0, Paid = 1
            migrationBuilder.Sql(@"
                UPDATE ""InvoiceExpenses"" 
                SET ""PaymentStatusTemp"" = CASE 
                    WHEN ""PaymentStatus"" = 'paid' THEN 1
                    ELSE 0
                END;
            ");

            // Drop the old PaymentStatus column
            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "InvoiceExpenses");

            // Rename PaymentStatusTemp to PaymentStatus
            migrationBuilder.RenameColumn(
                name: "PaymentStatusTemp",
                table: "InvoiceExpenses",
                newName: "PaymentStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Add temporary string column for Status
            migrationBuilder.AddColumn<string>(
                name: "StatusTemp",
                table: "Invoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "unpaid");

            // Convert integer values back to string
            migrationBuilder.Sql(@"
                UPDATE ""Invoices"" 
                SET ""StatusTemp"" = CASE 
                    WHEN ""Status"" = 2 THEN 'paid'
                    WHEN ""Status"" = 1 THEN 'partial'
                    ELSE 'unpaid'
                END;
            ");

            // Drop the old Status column
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Invoices");

            // Rename StatusTemp to Status
            migrationBuilder.RenameColumn(
                name: "StatusTemp",
                table: "Invoices",
                newName: "Status");

            // Do the same for InvoiceExpenses.PaymentStatus
            migrationBuilder.AddColumn<string>(
                name: "PaymentStatusTemp",
                table: "InvoiceExpenses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "unpaid");

            // Convert integer values back to string
            migrationBuilder.Sql(@"
                UPDATE ""InvoiceExpenses"" 
                SET ""PaymentStatusTemp"" = CASE 
                    WHEN ""PaymentStatus"" = 1 THEN 'paid'
                    ELSE 'unpaid'
                END;
            ");

            // Drop the old PaymentStatus column
            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "InvoiceExpenses");

            // Rename PaymentStatusTemp to PaymentStatus
            migrationBuilder.RenameColumn(
                name: "PaymentStatusTemp",
                table: "InvoiceExpenses",
                newName: "PaymentStatus");
        }
    }
}
