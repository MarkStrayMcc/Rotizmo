using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IClientsApi
    {
        Task<bool> HasSanctions(string clientName, string countryIsoCode, string stage, bool isSendEmail);
    }
}