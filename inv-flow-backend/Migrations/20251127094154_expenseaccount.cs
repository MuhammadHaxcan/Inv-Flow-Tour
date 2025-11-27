using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace inv_flow_backend.Migrations
{
    /// <inheritdoc />
    public partial class expenseaccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                table: "InvoiceExpenses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceExpenses_AccountId",
                table: "InvoiceExpenses",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceExpenses_Accounts_AccountId",
                table: "InvoiceExpenses",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceExpenses_Accounts_AccountId",
                table: "InvoiceExpenses");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceExpenses_AccountId",
                table: "InvoiceExpenses");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "InvoiceExpenses");
        }
    }
}
