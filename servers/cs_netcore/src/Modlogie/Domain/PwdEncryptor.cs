using System;
using System.Security.Cryptography;
using System.Text;

namespace Modlogie.Domain
{
    public static class PwdEncryptor
    {
        public static string Encrypt(string pwd)
        {
            var salt = "Salt for modlogie.";
            var pwdAndSalt = Encoding.UTF8.GetBytes(pwd + salt);
            var hashBytes = new SHA256Managed().ComputeHash(pwdAndSalt);
            var hashStr = Convert.ToBase64String(hashBytes);
            return hashStr;
        }

        public static bool ValidateUserName(string name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.IndexOf(" ", StringComparison.Ordinal) < 0;
        }

        public static bool ValidatePassword(string pwd)
        {
            return !string.IsNullOrWhiteSpace(pwd) && pwd.Length >= 8;
        }

        public static bool ValidateEmail(string email)
        {
            return !string.IsNullOrWhiteSpace(email);
        }
    }
}