using System.ComponentModel.DataAnnotations;

namespace BlogApi.Models
{
    public class SavedBlog
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public int BlogId { get; set; }
    }
}