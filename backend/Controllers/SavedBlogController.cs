using BlogApi.Models;
using BlogApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavedBlogsController : ControllerBase
    {
        private readonly SavedBlogService _service;

        public SavedBlogsController(SavedBlogService service)
        {
            _service = service;
        }

        // ✅ GET saved blogs for a user
        [HttpGet("{userId}")]
        public IActionResult GetSaved(string userId)
        {
            var savedIds = _service.GetSavedBlogIds(userId);
            return Ok(savedIds);
        }

        // ✅ POST save a blog
        [HttpPost("save")]
        public IActionResult Save([FromBody] SaveRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
                return BadRequest("UserId required");

            _service.SaveBlog(request.UserId, request.BlogId);
            return Ok();
        }

        // ✅ POST unsave a blog
        [HttpPost("unsave")]
        public IActionResult Unsave([FromBody] SaveRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
                return BadRequest("UserId required");

            _service.UnsaveBlog(request.UserId, request.BlogId);
            return Ok();
        }
    }

    // ✅ Request model for save/unsave
    public class SaveRequest
    {
        public string UserId { get; set; } = string.Empty;
        public int BlogId { get; set; }
    }
}