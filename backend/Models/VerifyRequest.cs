namespace BlogApi.Models
{
    public class VerifyRequest
    {
        public string Email { get; set; } = string.Empty;

        public string Otp { get; set; } = string.Empty;
    }
}