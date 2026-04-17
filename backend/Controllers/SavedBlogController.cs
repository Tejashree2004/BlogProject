using BlogApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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

        // ================= GET SAVED IDS ================= //
        // GET: /api/savedblogs/{userId}
        [HttpGet("{userId}")]
        public IActionResult GetSaved(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("UserId required");

            var savedIds = _service.GetSavedBlogIds(userId);
            return Ok(savedIds);
        }

        // ================= GET SAVED BLOGS (PAGINATED + SEARCH) ================= //
        // GET: /api/savedblogs?userId=xyz&pageNumber=1&pageSize=10&search=abc
        [HttpGet]
        public async Task<IActionResult> GetSavedPaginated(
            [FromQuery] string userId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = ""
        )
        {
            if (string.IsNullOrWhiteSpace(userId))
                return BadRequest("UserId required");

            // 🔥 MAIN FIX → search + pagination handled in service
            var result = await _service.GetSavedBlogsPaginated(
                userId,
                pageNumber,
                pageSize,
                search
            );

            return Ok(new
            {
                data = result.Blogs,
                totalCount = result.TotalCount
            });
        }

        // ================= SAVE BLOG ================= //
        // POST: /api/savedblogs/save
        [HttpPost("save")]
        public IActionResult Save([FromBody] SaveRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserId))
                return BadRequest("UserId required");

            _service.SaveBlog(request.UserId, request.BlogId);

            return Ok(new
            {
                message = "Blog saved successfully"
            });
        }

        // ================= UNSAVE BLOG ================= //
        // POST: /api/savedblogs/unsave
        [HttpPost("unsave")]
        public IActionResult Unsave([FromBody] SaveRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.UserId))
                return BadRequest("UserId required");

            _service.UnsaveBlog(request.UserId, request.BlogId);

            return Ok(new
            {
                message = "Blog unsaved successfully"
            });
        }
    }

    // ================= REQUEST MODEL ================= //
    public class SaveRequest
    {
        public string UserId { get; set; } = string.Empty;
        public int BlogId { get; set; }
    }
}