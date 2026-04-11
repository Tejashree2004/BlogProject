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

        // ✅ GET: /api/savedblogs/{userId}
        [HttpGet("{userId}")]
        public IActionResult GetSaved(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("UserId required");

            var savedIds = _service.GetSavedBlogIds(userId);
            return Ok(savedIds);
        }

        // 🔥 FIXED: PAGINATED SAVED BLOGS (ASYNC)
        // GET: /api/savedblogs?userId=xyz&pageNumber=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetSavedPaginated(
            [FromQuery] string userId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("UserId required");

            // ✅ FIX: await lagaya
            var result = await _service.GetSavedBlogsPaginated(userId, pageNumber, pageSize);

            return Ok(new
            {
                data = result.Blogs,
                totalCount = result.TotalCount
            });
        }

        // ✅ POST: /api/savedblogs/save
        [HttpPost("save")]
        public IActionResult Save([FromBody] SaveRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
                return BadRequest("UserId required");

            _service.SaveBlog(request.UserId, request.BlogId);
            return Ok(new { message = "Blog saved successfully" });
        }

        // ✅ POST: /api/savedblogs/unsave
        [HttpPost("unsave")]
        public IActionResult Unsave([FromBody] SaveRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
                return BadRequest("UserId required");

            _service.UnsaveBlog(request.UserId, request.BlogId);
            return Ok(new { message = "Blog unsaved successfully" });
        }
    }

    // ✅ Request model
    public class SaveRequest
    {
        public string UserId { get; set; } = string.Empty;
        public int BlogId { get; set; }
    }
}