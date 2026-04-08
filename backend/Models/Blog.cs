using System.ComponentModel.DataAnnotations;

namespace BlogApi.Models
{
    public class Blog
    {
        [Key] // 🔥 Primary Key
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Desc { get; set; } = string.Empty;

        // 🔥 IMAGE PATH
        public string Image { get; set; } = string.Empty;

        public string Category { get; set; } = "blog";

        public bool IsUserCreated { get; set; } = false;

        // 🔐 Owner of blog
        public string Author { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}