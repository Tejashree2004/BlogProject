using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BlogApi.Helpers
{
    public class JwtHelper
    {
        private readonly IConfiguration _config;

        public JwtHelper(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(string username)
        {
            // 🔐 Read config values
            var keyString = _config["Jwt:Key"];
            var durationStr = _config["Jwt:DurationInMinutes"];
            var issuer = _config["Jwt:Issuer"];
            var audience = _config["Jwt:Audience"];

            // ❗ Validate config
            if (string.IsNullOrWhiteSpace(keyString) ||
                string.IsNullOrWhiteSpace(durationStr) ||
                string.IsNullOrWhiteSpace(issuer) ||
                string.IsNullOrWhiteSpace(audience))
            {
                throw new InvalidOperationException("JWT configuration is missing in appsettings.");
            }

            // 🔐 Safe parse duration
            if (!double.TryParse(durationStr, out double durationMinutes))
            {
                durationMinutes = 60; // default fallback
            }

            var key = Encoding.ASCII.GetBytes(keyString);

            // 🔥 Claims (username stored here)
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.UniqueName, username), // unique_name claim for User.Identity.Name
                new Claim(ClaimTypes.Name, username)
            };

            // 🔐 Token setup
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(durationMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}