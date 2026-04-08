using BlogApi.Models;
using BlogApi.Data;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services
{
    public class BlogService
    {
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        public BlogService(AppDbContext context)
        {
            _context = context;

            // 🔥 uploads folder path (same as before)
            _uploadPath = Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads");

            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }

        // ✅ Get all active blogs
        public async Task<List<Blog>> GetAll()
        {
            return await _context.Blogs
                .Where(b => b.IsActive)
                .ToListAsync();
        }

        // ✅ Get blog by ID
        public async Task<Blog?> GetById(int id)
        {
            return await _context.Blogs
                .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
        }

        // ✅ Create blog
        public async Task<Blog> Create(Blog blog)
        {
            blog.IsUserCreated = true;
            blog.CreatedDate = DateTime.UtcNow;
            blog.IsActive = true;

            // 🔥 fallback author
            if (string.IsNullOrWhiteSpace(blog.Author))
                blog.Author = "guest_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            // 🔥 Image fallback
            if (string.IsNullOrWhiteSpace(blog.Image))
                blog.Image = "https://via.placeholder.com/300x200";

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();

            return blog;
        }

        // ✅ Update blog
        public async Task<Blog?> Update(int id, string title, string desc, string category, bool isActive, string? newImagePath = null)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
            if (blog == null) return null;

            blog.Title = title ?? blog.Title;
            blog.Desc = desc ?? blog.Desc;
            blog.Category = category ?? blog.Category;
            blog.IsActive = isActive;

            // 🔥 Update image
            if (!string.IsNullOrWhiteSpace(newImagePath))
            {
                if (!string.IsNullOrWhiteSpace(blog.Image) && blog.Image.StartsWith("/uploads"))
                {
                    var fullPath = Path.Combine(_uploadPath, Path.GetFileName(blog.Image));
                    if (File.Exists(fullPath))
                        File.Delete(fullPath);
                }

                blog.Image = newImagePath;
            }

            await _context.SaveChangesAsync();
            return blog;
        }

        // ✅ Delete blog (soft delete)
        public async Task<bool> Delete(int id, string? username = null)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == id);

            if (blog == null) return false;
            if (!blog.IsUserCreated) return false;

            if (!string.IsNullOrWhiteSpace(username) && blog.Author != username)
                return false;

            // 🔥 Delete uploaded image
            if (!string.IsNullOrWhiteSpace(blog.Image) && blog.Image.StartsWith("/uploads"))
            {
                var fullPath = Path.Combine(_uploadPath, Path.GetFileName(blog.Image));
                if (File.Exists(fullPath))
                    File.Delete(fullPath);
            }

            blog.IsActive = false;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}