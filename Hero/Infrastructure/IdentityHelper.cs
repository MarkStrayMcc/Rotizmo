using Cfc.ActiveDirectory;
using Hero.Integration.CoreApi.Interfaces;
using System.Collections.Generic;
using System.Linq;
using WebApiDto.Dto;

namespace Hero.Infrastructure
{
    public class IdentityHelper : IIdentityHelper
    {
        private readonly ICfcActiveDirectory _cfcActiveDirectory;
        private readonly ICfcContactApi _cfcContactApi;

        public IdentityHelper(ICfcActiveDirectory cfcActiveDirectory, ICfcContactApi cfcContactApi)
        {
            _cfcActiveDirectory = cfcActiveDirectory;
            _cfcContactApi = cfcContactApi;
        }

        public Dictionary<string, string> GetUserDictionary(string windowsIdentityName)
        {
            var userEmail = _cfcActiveDirectory.GetUserEmail(windowsIdentityName);
            var userName = userEmail.Split('@').First();
            var userCfcContact = _cfcContactApi.GetByUsernameAsync(userName).Result;
            return CreateUserDictionary(userCfcContact);
        }

        private static Dictionary<string, string> CreateUserDictionary(CfcContact user)
        {
            var userDictionary = new Dictionary<string, string>
            {
                {"Email", user.Email},
                {"User", user.Initials},
                {"Team", user.CfcTeamName},
                {"AccessLevel", user.AccessLevel.ToString()}
            };

            return userDictionary;
        }

        public string GetUserEmail(string windowsIdentityName)
        {
            return _cfcActiveDirectory.GetUserEmail(windowsIdentityName);
        }
    }
}
