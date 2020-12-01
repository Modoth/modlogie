using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Modlogie.Domain;

namespace Modlogie.Api.Controllers
{

    [Route("[controller]")]
    public class WxController : Controller
    {
        [HttpGet]
        public async Task<Object> Get(string signature, string timestamp, string nonce,
        string echostr, [FromServices] IKeyValuesEntityService keyvalueService)
        {
            if (signature == null || timestamp == null || nonce == null)
            {
                throw new Exception();
            }
            var token = await keyvalueService.GetValue(ServerKeys.WxValidateToken.Key);
            if (String.IsNullOrWhiteSpace(token))
            {
                throw new Exception();
            }
            if (!CheckSignature(signature, token, timestamp, nonce))
            {
                throw new Exception();
            }
            if (echostr != null)
            {
                return echostr;
            }
            throw new NotImplementedException();
        }

        private bool CheckSignature(string signature, string token, string timestamp, string nonce)
        {
            var tokens = new List<string> { token, timestamp, nonce };
            tokens.Sort();
            var str = String.Join("", tokens);
            var e = new SHA1CryptoServiceProvider();
            var mSig = BinaryToHex(e.ComputeHash(Encoding.UTF8.GetBytes(str)));
            return String.Equals(mSig, signature.ToUpper(), StringComparison.CurrentCultureIgnoreCase);
        }

        private static string BinaryToHex(byte[] data)
        {
            char[] hex = new char[checked(data.Length * 2)];

            for (int i = 0; i < data.Length; i++)
            {
                byte thisByte = data[i];
                hex[2 * i] = NibbleToHex((byte)(thisByte >> 4));
                hex[2 * i + 1] = NibbleToHex((byte)(thisByte & 0xf));
            }

            return new string(hex);
        }

        private static char NibbleToHex(byte nibble)
        {
            return (char)((nibble < 10) ? (nibble + '0') : (nibble - 10 + 'A'));
        }
    }
}