using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace inv_flow_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPaxBasedToExpenseType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPaxBased",
                table: "ExpenseTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaxBased",
                table: "ExpenseTypes");
        }
    }
}
