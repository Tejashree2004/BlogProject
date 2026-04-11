using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using BlogApi.Data;
using BlogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogApi.Services
{
    public class SavedBlogService
    {
        private readonly string _filePath;
        private readonly object _fileLock = new();

        private readonly AppDbContext _context;

        public SavedBlogService(IWebHostEnvironment env, AppDbContext context)
        {
            var contentRoot = env?.ContentRootPath ?? AppContext.BaseDirectory;
            _filePath = Path.Combine(contentRoot, "savedBlogs.json");

            _context = context;

            try
            {
                var dir = Path.GetDirectoryName(_filePath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                    Directory.CreateDirectory(dir);

                if (!File.Exists(_filePath))
                    File.WriteAllText(_filePath, "{}");
            }
            catch { }
        }

        // ================= READ =================
        private Dictionary<string, List<int>> ReadAll()
        {
            lock (_fileLock)
            {
                try
                {
                    if (!File.Exists(_filePath))
                        return new Dictionary<string, List<int>>();

                    var json = File.ReadAllText(_filePath);

                    if (string.IsNullOrWhiteSpace(json))
                        return new Dictionary<string, List<int>>();

                    var data = JsonSerializer.Deserialize<Dictionary<string, List<int>>>(
                        json,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    );

                    return data ?? new Dictionary<string, List<int>>();
                }
                catch
                {
                    return new Dictionary<string, List<int>>();
                }
            }
        }

        // ================= WRITE =================
        private void WriteAll(Dictionary<string, List<int>> data)
        {
            lock (_fileLock)
            {
                try
                {
                    var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
                    {
                        WriteIndented = true
                    });

                    File.WriteAllText(_filePath, json);
                }
                catch { }
            }
        }

        // ================= GET SAVED IDS =================
        public List<int> GetSavedBlogIds(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new List<int>();

            var data = ReadAll();

            return data.ContainsKey(userId)
                ? new List<int>(data[userId])
                : new List<int>();
        }

        // 🔥🔥🔥 FINAL OPTIMIZED METHOD
        public async Task<(List<Blog> Blogs, int TotalCount)> GetSavedBlogsPaginated(
            string userId,
            int pageNumber,
            int pageSize)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (new List<Blog>(), 0);

            var savedIds = GetSavedBlogIds(userId);

            if (savedIds.Count == 0)
                return (new List<Blog>(), 0);

            var query = _context.Blogs
                .Where(b => b.IsActive && savedIds.Contains(b.Id))
                .OrderByDescending(b => b.CreatedDate);

            var totalCount = await query.CountAsync();

            var blogs = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (blogs, totalCount);
        }

        // ================= SAVE =================
        public void SaveBlog(string userId, int blogId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return;

            var data = ReadAll();

            if (!data.ContainsKey(userId))
                data[userId] = new List<int>();

            if (!data[userId].Contains(blogId))
            {
                data[userId].Add(blogId);
                WriteAll(data);
            }
        }

        // ================= UNSAVE =================
        public void UnsaveBlog(string userId, int blogId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return;

            var data = ReadAll();

            if (data.ContainsKey(userId))
            {
                data[userId].Remove(blogId);

                if (data[userId].Count == 0)
                    data.Remove(userId);

                WriteAll(data);
            }
        }
    }
}