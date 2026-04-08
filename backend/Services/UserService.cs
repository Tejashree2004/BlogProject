using BlogApi.Models;
using BlogApi.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Services;

namespace BlogApi.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public UserService(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ===================== CREATE USER ===================== //
        public async Task<User?> Create(User user)
        {
            if (user == null || string.IsNullOrWhiteSpace(user.Email))
                return null;

            var email = user.Email.ToLower().Trim();

            var exists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email);

            if (exists)
                return null;

            user.Email = email;
            user.CreatedDate = DateTime.UtcNow;
            user.IsVerified = false;
            user.Otp = null;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        // ===================== AUTHENTICATE ===================== //
        public async Task<User?> Authenticate(string usernameOrEmail, string password)
        {
            if (string.IsNullOrWhiteSpace(usernameOrEmail) || string.IsNullOrWhiteSpace(password))
                return null;

            var login = usernameOrEmail.ToLower().Trim();

            return await _context.Users.FirstOrDefaultAsync(u =>
                (u.Email.ToLower() == login ||
                 (!string.IsNullOrEmpty(u.Username) && u.Username.ToLower() == login)) &&
                u.Password == password &&
                u.IsVerified
            );
        }

        // ===================== GENERATE OTP ===================== //
        public async Task<string> GenerateOtp(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return "INVALID_EMAIL";

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower().Trim());

            if (user == null)
                return "NOT_FOUND";

            var otp = new Random().Next(100000, 999999).ToString();

            user.Otp = otp;
            await _context.SaveChangesAsync();

            // 🔥 DEBUG: console me OTP dikhega (VERY IMPORTANT)
            Console.WriteLine($"✅ OTP for {email}: {otp}");

            try
            {
                await _emailService.SendEmailAsync(
                    email,
                    "Your OTP Code",
                    otp   // clean OTP (no extra text)
                );
            }
            catch (Exception ex)
            {
                // ❌ Email fail but system continue karega
                Console.WriteLine("❌ Email Error: " + ex.Message);
            }

            return otp;
        }

        // ===================== VERIFY OTP ===================== //
        public async Task<bool> VerifyOtp(string email, string otp)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
                return false;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower().Trim());

            if (user == null)
                return false;

            if (user.IsVerified)
                return true;

            if (user.Otp == otp)
            {
                user.IsVerified = true;
                user.Otp = null;

                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
    }
}