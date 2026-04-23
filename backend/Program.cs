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
// ================= RAILWAY PORT FIX =================
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
// ================= CORS =================
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
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
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//
// ================= JWT =================
//
var jwtSettings = builder.Configuration.GetSection("Jwt");

var keyString = jwtSettings["Key"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

if (string.IsNullOrWhiteSpace(keyString) ||
    string.IsNullOrWhiteSpace(issuer) ||
    string.IsNullOrWhiteSpace(audience))
{
    Console.WriteLine("⚠ JWT config missing - app may fail auth");
}

var key = Encoding.ASCII.GetBytes(keyString ?? "dummy-key-for-dev");

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
// ================= DATABASE MIGRATION SAFE =================
//
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        context.Database.Migrate();

        // Seed Blogs
        if (!context.Blogs.Any())
        {
            context.Blogs.AddRange(new List<Blog>
            {
                new Blog { Title="AI in 2026", Desc="AI is growing...", Image="https://picsum.photos/300/200?1", Category="blog", IsActive=true },
                new Blog { Title="React UI Design", Desc="Reusable components", Image="https://picsum.photos/300/200?2", Category="blog", IsActive=true },
                new Blog { Title="JavaScript Tips", Desc="JS fundamentals", Image="https://picsum.photos/300/200?3", Category="blog", IsActive=true }
            });

            context.SaveChanges();
        }

        // Seed User
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
        Console.WriteLine("DB init error: " + ex.Message);
    }
}

//
// ================= MIDDLEWARE =================
//
app.UseCors("AllowAll");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

//
// ================= SWAGGER (PRODUCTION SAFE) =================
//
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Blog API V1");
    c.RoutePrefix = string.Empty; // root URL pe swagger
});

app.MapControllers();

app.Run();