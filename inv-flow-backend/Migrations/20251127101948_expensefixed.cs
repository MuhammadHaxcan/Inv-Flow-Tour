using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace inv_flow_backend.Migrations
{
    /// <inheritdoc />
    public partial class expensefixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "PaidDate",
                table: "InvoiceExpenses",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Pax",
                table: "InvoiceExpenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "InvoiceExpenses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "InvoiceExpenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VendorName",
                table: "InvoiceExpenses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Vendors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vendors", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceExpenses_VendorId",
                table: "InvoiceExpenses",
                column: "VendorId");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceExpenses_Vendors_VendorId",
                table: "InvoiceExpenses",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceExpenses_Vendors_VendorId",
                table: "InvoiceExpenses");

            migrationBuilder.DropTable(
                name: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceExpenses_VendorId",
                table: "InvoiceExpenses");

            migrationBuilder.DropColumn(
                name: "PaidDate",
                table: "InvoiceExpenses");

            migrationBuilder.DropColumn(
                name: "Pax",
                table: "InvoiceExpenses");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "InvoiceExpenses");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "InvoiceExpenses");

            migrationBuilder.DropColumn(
                name: "VendorName",
                table: "InvoiceExpenses");
        }
    }
}
