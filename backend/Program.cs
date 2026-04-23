using BlogApi.Services;
using BlogApi.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using BlogApi.Data;
using BlogApi.Models;

var builder = WebApplication.CreateBuilder(args);

//
// ================= RAILWAY PORT FIX (DO NOT REMOVE) =================
//
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

//
// ================= CONTROLLERS =================
//
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

//
// ================= CORS (PRODUCTION SAFE) =================
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

//
// ================= DATABASE =================
//
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseNpgsql(conn, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure();
    });
});

//
// ================= JWT CONFIG =================
//
var jwtSettings = builder.Configuration.GetSection("Jwt");

var keyString = jwtSettings["Key"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

if (string.IsNullOrWhiteSpace(keyString))
    keyString = "dev-key-123456789";

if (string.IsNullOrWhiteSpace(issuer))
    issuer = "BlogApi";

if (string.IsNullOrWhiteSpace(audience))
    audience = "BlogUsers";

var key = Encoding.ASCII.GetBytes(keyString);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,

        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

//
// ================= SWAGGER =================
//
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//
// ================= SERVICES =================
//
builder.Services.AddScoped<BlogService>();
builder.Services.AddScoped<SavedBlogService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtHelper>();

var app = builder.Build();

//
// ================= DATABASE SAFE MIGRATION =================
//
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        context.Database.Migrate();

        if (!context.Blogs.Any())
        {
            context.Blogs.AddRange(new List<Blog>
            {
                new Blog
                {
                    Title = "AI in 2026",
                    Desc = "AI is growing rapidly...",
                    Image = "https://picsum.photos/300/200?1",
                    Category = "blog",
                    IsUserCreated = false,
                    Author = "",
                    IsActive = true
                },
                new Blog
                {
                    Title = "React UI Design",
                    Desc = "Reusable components",
                    Image = "https://picsum.photos/300/200?2",
                    Category = "blog",
                    IsUserCreated = false,
                    Author = "",
                    IsActive = true
                },
                new Blog
                {
                    Title = "JavaScript Tips",
                    Desc = "JS fundamentals",
                    Image = "https://picsum.photos/300/200?3",
                    Category = "blog",
                    IsUserCreated = false,
                    Author = "",
                    IsActive = true
                }
            });

            context.SaveChanges();
        }

        if (!context.Users.Any())
        {
            context.Users.Add(new User
            {
                Username = "testuser",
                Email = "test@gmail.com",
                Password = "12345678",
                IsGuest = false,
                CreatedDate = DateTime.UtcNow,
                IsVerified = true
            });

            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("DB INIT ERROR: " + ex.Message);
    }
}

//
// ================= MIDDLEWARE =================
//
app.UseCors("AllowReact");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

//
// ================= SWAGGER =================
//
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Blog API V1");
    c.RoutePrefix = string.Empty;
});

app.MapControllers();

app.Run();