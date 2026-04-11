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

            _uploadPath = Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads");

            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }

        // ================= BASIC METHODS ================= //

        public async Task<List<Blog>> GetAll()
        {
            return await _context.Blogs
                .Where(b => b.IsActive)
                .ToListAsync();
        }

        public async Task<Blog?> GetById(int id)
        {
            return await _context.Blogs
                .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);
        }

        // 🔥 NEW: Queryable (IMPORTANT FOR SEARCH FIX)
        public IQueryable<Blog> GetQueryable()
        {
            return _context.Blogs.Where(b => b.IsActive);
        }

        // ================= CREATE ================= //

        public async Task<Blog> Create(Blog blog)
        {
            blog.IsUserCreated = true;
            blog.CreatedDate = DateTime.UtcNow;
            blog.UpdatedDate = null;
            blog.IsActive = true;

            if (string.IsNullOrWhiteSpace(blog.Author))
                blog.Author = "guest_" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            if (string.IsNullOrWhiteSpace(blog.Image))
                blog.Image = "https://via.placeholder.com/300x200";

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();

            return blog;
        }

        // ================= UPDATE ================= //

        public async Task<Blog?> Update(
            int id,
            string title,
            string desc,
            string category,
            bool isActive,
            string? newImagePath = null
        )
        {
            var blog = await _context.Blogs
                .FirstOrDefaultAsync(b => b.Id == id && b.IsActive);

            if (blog == null) return null;

            blog.Title = title ?? blog.Title;
            blog.Desc = desc ?? blog.Desc;
            blog.Category = category ?? blog.Category;
            blog.IsActive = isActive;
            blog.UpdatedDate = DateTime.UtcNow;

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

        // ================= DELETE ================= //

        public async Task<bool> Delete(int id, string? username = null)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.Id == id);

            if (blog == null) return false;
            if (!blog.IsUserCreated) return false;

            if (!string.IsNullOrWhiteSpace(username) && blog.Author != username)
                return false;

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

        // ================= PAGINATION ================= //

        public async Task<(List<Blog> Data, int TotalCount)> GetPaginated(int pageNumber, int pageSize)
        {
            var query = _context.Blogs
                .Where(b => b.IsActive)
                .OrderByDescending(b => b.CreatedDate);

            var totalCount = await query.CountAsync();

            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        public async Task<(List<Blog> Data, int TotalCount)> GetMyBlogsPaginated(
            string username,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Blogs
                .Where(b => b.IsActive && b.Author == username)
                .OrderByDescending(b => b.CreatedDate);

            var totalCount = await query.CountAsync();

            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        // ================= 🔥 FINAL FEED (SEARCH FIXED) ================= //

        public async Task<(List<Blog> Data, int TotalCount)> GetFeedPaginated(
            string? username,
            int pageNumber,
            int pageSize,
            string? search = ""
        )
        {
            var query = _context.Blogs
                .Where(b => b.IsActive);

            // 🔥 Exclude current user blogs
            if (!string.IsNullOrEmpty(username))
            {
                query = query.Where(b => b.Author != username);
            }

            // 🔥 GLOBAL SEARCH (BEFORE PAGINATION)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();

                query = query.Where(b =>
                    (b.Title != null && b.Title.ToLower().Contains(lowerSearch)) ||
                    (b.Desc != null && b.Desc.ToLower().Contains(lowerSearch))
                );
            }

            // 🔥 SORTING
            query = query.OrderByDescending(b => b.CreatedDate);

            // 🔥 TOTAL COUNT AFTER SEARCH
            var totalCount = await query.CountAsync();

            // 🔥 PAGINATION
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }
    }
}