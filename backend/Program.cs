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

// ================= CONTROLLERS ================= //
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// ================= CORS ================= //
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ================= DATABASE ================= //
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ================= JWT CONFIG ================= //
var jwtSettings = builder.Configuration.GetSection("Jwt");

var keyString = jwtSettings["Key"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

if (string.IsNullOrWhiteSpace(keyString) ||
    string.IsNullOrWhiteSpace(issuer) ||
    string.IsNullOrWhiteSpace(audience))
{
    throw new InvalidOperationException("JWT configuration missing");
}

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

// ================= SWAGGER ================= //
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ================= SMTP CHECK ================= //
var smtpEmail = Environment.GetEnvironmentVariable("SMTP_EMAIL");
var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD");

if (string.IsNullOrWhiteSpace(smtpEmail) ||
    string.IsNullOrWhiteSpace(smtpPassword))
{
    Console.WriteLine("⚠ SMTP not configured");
}
else
{
    Console.WriteLine("✅ SMTP configured");
}

// ================= SERVICES ================= //
builder.Services.AddScoped<BlogService>();
builder.Services.AddScoped<SavedBlogService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<JwtHelper>();

var app = builder.Build();

// ================= SEED + MIGRATION SAFE ================= //
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
        Console.WriteLine("Migration/Seeding failed: " + ex.Message);
    }
}

// ================= MIDDLEWARE ================= //
app.UseCors("AllowReact");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// ================= SWAGGER (FIXED FOR PRODUCTION) ================= //
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();