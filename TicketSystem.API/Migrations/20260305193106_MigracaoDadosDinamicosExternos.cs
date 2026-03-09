using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class MigracaoDadosDinamicosExternos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AutomationTickets_Users_RequesterId",
                table: "AutomationTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionLines_Users_CreatedByUserId",
                table: "ProductionLines");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionLines_Users_UpdatedByUserId",
                table: "ProductionLines");

            migrationBuilder.DropForeignKey(
                name: "FK_SetupTickets_Users_RequesterId",
                table: "SetupTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_SetupTickets_Users_ResolverId",
                table: "SetupTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_SoftwareTickets_Users_RequesterId",
                table: "SoftwareTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TestTickets_Users_RequesterId",
                table: "TestTickets");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_TestTickets_RequesterId",
                table: "TestTickets");

            migrationBuilder.DropIndex(
                name: "IX_SoftwareTickets_RequesterId",
                table: "SoftwareTickets");

            migrationBuilder.DropIndex(
                name: "IX_SetupTickets_RequesterId",
                table: "SetupTickets");

            migrationBuilder.DropIndex(
                name: "IX_SetupTickets_ResolverId",
                table: "SetupTickets");

            migrationBuilder.DropIndex(
                name: "IX_ProductionLines_CreatedByUserId",
                table: "ProductionLines");

            migrationBuilder.DropIndex(
                name: "IX_ProductionLines_UpdatedByUserId",
                table: "ProductionLines");

            migrationBuilder.DropIndex(
                name: "IX_AutomationTickets_RequesterId",
                table: "AutomationTickets");

            migrationBuilder.AddColumn<string>(
                name: "RequesterName",
                table: "TestTickets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RequesterName",
                table: "SoftwareTickets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RequesterName",
                table: "SetupTickets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RequesterName",
                table: "AutomationTickets",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequesterName",
                table: "TestTickets");

            migrationBuilder.DropColumn(
                name: "RequesterName",
                table: "SoftwareTickets");

            migrationBuilder.DropColumn(
                name: "RequesterName",
                table: "SetupTickets");

            migrationBuilder.DropColumn(
                name: "RequesterName",
                table: "AutomationTickets");

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FullName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Registration = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Username = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_TestTickets_RequesterId",
                table: "TestTickets",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_SoftwareTickets_RequesterId",
                table: "SoftwareTickets",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_SetupTickets_RequesterId",
                table: "SetupTickets",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_SetupTickets_ResolverId",
                table: "SetupTickets",
                column: "ResolverId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionLines_CreatedByUserId",
                table: "ProductionLines",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionLines_UpdatedByUserId",
                table: "ProductionLines",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AutomationTickets_RequesterId",
                table: "AutomationTickets",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Name",
                table: "Departments",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_DepartmentId",
                table: "Users",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Registration",
                table: "Users",
                column: "Registration",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AutomationTickets_Users_RequesterId",
                table: "AutomationTickets",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionLines_Users_CreatedByUserId",
                table: "ProductionLines",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionLines_Users_UpdatedByUserId",
                table: "ProductionLines",
                column: "UpdatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SetupTickets_Users_RequesterId",
                table: "SetupTickets",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SetupTickets_Users_ResolverId",
                table: "SetupTickets",
                column: "ResolverId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SoftwareTickets_Users_RequesterId",
                table: "SoftwareTickets",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TestTickets_Users_RequesterId",
                table: "TestTickets",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
