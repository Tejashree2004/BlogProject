using System.ComponentModel.DataAnnotations;

namespace BlogApi.Models
{
    public class User
    {
        [Key] // 🔥 Primary Key
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public bool IsGuest { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public bool IsVerified { get; set; } = false;

        // 🔥 OTP field
        public string? Otp { get; set; }
    }
}