using System.ComponentModel.DataAnnotations;

namespace BlogApi.Models
{
    public class SaveRequest
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int BlogId { get; set; }
    }
}