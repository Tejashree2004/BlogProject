using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;

namespace BlogApi.Services
{
    public class SavedBlogService
    {
        private readonly string _filePath;
        private readonly object _fileLock = new();

        public SavedBlogService(IWebHostEnvironment env)
        {
            var contentRoot = env?.ContentRootPath ?? AppContext.BaseDirectory;
            _filePath = Path.Combine(contentRoot, "savedBlogs.json");

            try
            {
                var dir = Path.GetDirectoryName(_filePath);
                if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                    Directory.CreateDirectory(dir);

                if (!File.Exists(_filePath))
                    File.WriteAllText(_filePath, "{}");
            }
            catch
            {
                // log in real apps
            }
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
                catch
                {
                    // log in real apps
                }
            }
        }

        // ================= GET SAVED BLOGS =================
        public List<int> GetSavedBlogIds(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return new List<int>();

            var data = ReadAll();

            return data.ContainsKey(userId)
                ? new List<int>(data[userId])
                : new List<int>();
        }

        // ================= SAVE BLOG =================
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

        // ================= UNSAVE BLOG =================
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