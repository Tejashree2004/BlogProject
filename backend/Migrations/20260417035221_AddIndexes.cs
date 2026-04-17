using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class AddIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 🔥 INDEXES
            migrationBuilder.CreateIndex(
                name: "idx_users_email",
                table: "Users",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "idx_blogs_createddate",
                table: "Blogs",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "idx_blogs_author",
                table: "Blogs",
                column: "Author");

            // 🔥 UNIQUE USERNAME
            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            // 🔥 DEFAULT VALUES (Users)
            migrationBuilder.AlterColumn<bool>(
                name: "IsGuest",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<bool>(
                name: "IsVerified",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            // 🔥 DEFAULT VALUES (Blogs)
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "Blogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 🔥 REMOVE INDEXES
            migrationBuilder.DropIndex(
                name: "idx_users_email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "idx_blogs_createddate",
                table: "Blogs");

            migrationBuilder.DropIndex(
                name: "idx_blogs_author",
                table: "Blogs");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            // 🔥 REMOVE DEFAULT VALUES (Users)
            migrationBuilder.AlterColumn<bool>(
                name: "IsGuest",
                table: "Users",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "IsVerified",
                table: "Users",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");

            // 🔥 REMOVE DEFAULT VALUES (Blogs)
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "Blogs",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "CURRENT_TIMESTAMP");
        }
    }
}