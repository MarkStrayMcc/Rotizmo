using System.Collections.Generic;

namespace Hero.Infrastructure
{
    public interface IIdentityHelper
    {
        Dictionary<string, string> GetUserDictionary(string windowsIdentityName);
        string GetUserEmail(string windowsIdentityName);
    }
}
