using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Recipient email is required", nameof(toEmail));

            try
            {
                var emailSettings = _config.GetSection("SMTP");

                // ✅ Safe config reading
                string senderEmail =
                    Environment.GetEnvironmentVariable("SMTP_EMAIL") ??
                    emailSettings["Email"] ??
                    throw new Exception("SMTP Email not configured");

                string senderPassword =
                    Environment.GetEnvironmentVariable("SMTP_PASSWORD") ??
                    emailSettings["Password"] ??
                    throw new Exception("SMTP Password not configured");

                string smtpHost = emailSettings["Host"] ?? "smtp.gmail.com";

                int smtpPort = 587;
                var sslOption = SecureSocketOptions.StartTls;

                // ✅ Create email
                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress("Blog App", senderEmail));
                emailMessage.To.Add(MailboxAddress.Parse(toEmail));
                emailMessage.Subject = string.IsNullOrWhiteSpace(subject) ? "OTP Verification" : subject;

                var currentTime = DateTime.Now.ToString("f");

                string emailBody = $@"
<html>
<body style='font-family: Arial, sans-serif; line-height:1.6; color:#111;'>

<p>Hello,</p>

<p>We received a request to access your <b>BlogApp</b> account. Please use the One-Time Password (OTP) below to proceed:</p>

<p style='font-size:22px; font-weight:bold; color:#2563eb; letter-spacing:3px; text-align:center; margin:20px 0;'>
    {message}
</p>

<p>This OTP is valid for <b>10 minutes</b>. For your security, please do not share this code with anyone.</p>

<p><b>Request Time:</b> {currentTime}</p>

<p>If you did not initiate this request, you can safely ignore this email. No further action is required.</p>

<br/>

<p>Best regards,<br/>
<b>BlogApp Team</b></p>

</body>
</html>
";

                emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                {
                    Text = emailBody
                };

                using var client = new SmtpClient();

                // ✅ Timeout fix (important)
                client.Timeout = 10000;

                // ✅ Connect
                await client.ConnectAsync(smtpHost, smtpPort, sslOption);

                // ✅ Authenticate
                await client.AuthenticateAsync(senderEmail, senderPassword);

                // ✅ Send
                await client.SendAsync(emailMessage);

                // ✅ Disconnect
                await client.DisconnectAsync(true);

                Console.WriteLine($"✅ Email sent successfully to {toEmail}");
            }
            catch (Exception ex)
            {
                // ❌ Don't crash API (IMPORTANT FIX)
                Console.WriteLine("❌ Email send failed: " + ex.Message);

                // OPTIONAL: comment below line if you don't want API to fail
                // throw;
            }
        }
    }
}