using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BlogApi.Models;
using BlogApi.Services;
using System.IO;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogsController : ControllerBase
    {
        private readonly BlogService _blogService;
        private readonly SavedBlogService _savedService;

        public BlogsController(BlogService blogService, SavedBlogService savedService)
        {
            _blogService = blogService;
            _savedService = savedService;
        }

        // ================= PUBLIC ================= //

        [HttpGet]
        public async Task<IActionResult> GetAll(int pageNumber = 1, int pageSize = 10)
        {
            var result = await _blogService.GetPaginated(pageNumber, pageSize);

            return Ok(new
            {
                data = result.Data,
                totalCount = result.TotalCount
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var blog = await _blogService.GetById(id);
            if (blog == null) return NotFound();

            return Ok(blog);
        }

        // ================= AUTHORIZED ================= //

        [Authorize]
        [HttpGet("myblogs")]
        public async Task<IActionResult> GetMyBlogs(
            int pageNumber = 1,
            int pageSize = 10,
            string? search = ""
        )
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var result = await _blogService.GetMyBlogsPaginated(
                username,
                pageNumber,
                pageSize,
                search
            );

            return Ok(new
            {
                data = result.Data,
                totalCount = result.TotalCount
            });
        }

        // ================= FEED ================= //

        [AllowAnonymous]
        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed(
            int pageNumber = 1,
            int pageSize = 10,
            string? search = ""
        )
        {
            var username = GetUsernameFromToken();

            var result = await _blogService.GetFeedPaginated(
                username,
                pageNumber,
                pageSize,
                search
            );

            return Ok(new
            {
                data = result.Data,
                totalCount = result.TotalCount
            });
        }

        // ================= SAVED BLOGS ================= //

        [Authorize]
        [HttpGet("saved")]
        public IActionResult GetSavedBlogs()
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username))
                return BadRequest(new { message = "User not identified from token." });

            var savedIds = _savedService.GetSavedBlogIds(username);
            return Ok(savedIds);
        }

        [Authorize]
        [HttpPost("save/{id}")]
        public IActionResult SaveBlog(int id)
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username))
                return BadRequest(new { message = "User not identified from token." });

            _savedService.SaveBlog(username, id);

            return Ok(new { message = "Blog saved successfully." });
        }

        [Authorize]
        [HttpDelete("save/{id}")]
        public IActionResult UnsaveBlog(int id)
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username))
                return BadRequest(new { message = "User not identified from token." });

            _savedService.UnsaveBlog(username, id);

            return Ok(new { message = "Blog unsaved successfully." });
        }

        // ================= CRUD ================= //

        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]   // ✅ FIXED SWAGGER
      public async Task<IActionResult> Create(
    [FromForm] string title,
    [FromForm] string desc,
    [FromForm] string category,
    [FromForm] bool isActive,
    IFormFile? image   // ❌ FromForm REMOVE karo
)
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            string imagePath = null;

            if (image != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = Guid.NewGuid() + Path.GetExtension(image.FileName);
                var fullPath = Path.Combine(folderPath, fileName);

                using var stream = new FileStream(fullPath, FileMode.Create);
                await image.CopyToAsync(stream);

                imagePath = $"/uploads/{fileName}";
            }

            var blog = new Blog
            {
                Title = title,
                Desc = desc,
                Category = category,
                IsActive = isActive,
                IsUserCreated = true,
                Author = username,
                Image = imagePath ?? "https://picsum.photos/300/200?random"
            };

            var created = await _blogService.Create(blog);

            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [Authorize]
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]   // ✅ FIXED SWAGGER
    public async Task<IActionResult> Update(
    int id,
    [FromForm] string title,
    [FromForm] string desc,
    [FromForm] string category,
    [FromForm] bool isActive,
    IFormFile? image   // ❌ FromForm REMOVE
)
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var blog = await _blogService.GetById(id);
            if (blog == null) return NotFound();

            if (blog.Author != username) return Forbid();

            string imagePath = null;

            if (image != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = Guid.NewGuid() + Path.GetExtension(image.FileName);
                var fullPath = Path.Combine(folderPath, fileName);

                using var stream = new FileStream(fullPath, FileMode.Create);
                await image.CopyToAsync(stream);

                imagePath = $"/uploads/{fileName}";
            }

            var updated = await _blogService.Update(id, title, desc, category, isActive, imagePath);

            return Ok(updated);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var username = GetUsernameFromToken();
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var blog = await _blogService.GetById(id);
            if (blog == null) return NotFound();

            if (blog.Author != username) return Forbid();

            var success = await _blogService.Delete(id, username);

            if (!success)
                return BadRequest(new { message = "Delete failed." });

            return Ok(new { message = "Blog deleted successfully." });
        }

        // ================= HELPER ================= //

        private string? GetUsernameFromToken()
        {
            return User.Identity?.Name ??
                   User.FindFirst(ClaimTypes.Name)?.Value ??
                   User.FindFirst("unique_name")?.Value;
        }
    }
}