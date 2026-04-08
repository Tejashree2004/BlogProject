using BlogApi.Models;
using BlogApi.Services;
using BlogApi.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace BlogApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly JwtHelper _jwtHelper;

        public AuthController(UserService userService, JwtHelper jwtHelper)
        {
            _userService = userService;
            _jwtHelper = jwtHelper;
        }

        // ===================== SIGNUP ===================== //
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] User newUser)
        {
            if (newUser == null ||
                string.IsNullOrWhiteSpace(newUser.Email) ||
                string.IsNullOrWhiteSpace(newUser.Username) ||
                string.IsNullOrWhiteSpace(newUser.Password))
            {
                return BadRequest(new { message = "Email, Username, and Password are required." });
            }

            try
            {
                var createdUser = await _userService.Create(newUser);

                if (createdUser == null)
                    return BadRequest(new { message = "User already exists." });

                // ✅ Generate OTP
                var otp = await _userService.GenerateOtp(createdUser.Email);

                // 🔥 Debug (optional - remove later)
                Console.WriteLine($"OTP for {createdUser.Email}: {otp}");

                return Ok(new
                {
                    message = "User created successfully. OTP sent.",
                    email = createdUser.Email
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Signup Error: " + ex.Message);

                return StatusCode(500, new
                {
                    message = "Signup failed. Please try again."
                });
            }
        }

        // ===================== LOGIN ===================== //
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginRequest)
        {
            if (loginRequest == null ||
                string.IsNullOrWhiteSpace(loginRequest.Email) ||
                string.IsNullOrWhiteSpace(loginRequest.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            try
            {
                var user = await _userService.Authenticate(loginRequest.Email, loginRequest.Password);

                if (user == null)
                {
                    return Unauthorized(new
                    {
                        message = "Invalid credentials or email not verified."
                    });
                }

                var token = _jwtHelper.GenerateToken(user.Username);

                return Ok(new
                {
                    token,
                    username = user.Username,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Login Error: " + ex.Message);

                return StatusCode(500, new
                {
                    message = "Login failed. Please try again."
                });
            }
        }

        // ===================== VERIFY EMAIL ===================== //
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Otp))
            {
                return BadRequest(new { message = "Email and OTP are required." });
            }

            try
            {
                var result = await _userService.VerifyOtp(request.Email, request.Otp);

                if (!result)
                {
                    return BadRequest(new { message = "Invalid OTP." });
                }

                return Ok(new
                {
                    message = "Email verified successfully."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Verify Error: " + ex.Message);

                return StatusCode(500, new
                {
                    message = "Verification failed. Please try again."
                });
            }
        }
    }
}