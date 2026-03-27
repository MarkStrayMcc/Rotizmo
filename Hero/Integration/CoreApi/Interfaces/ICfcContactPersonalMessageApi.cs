using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ICfcContactPersonalMessageApi
    {
        Task<CfcContactPersonalMessage> GetPersonalMessageById(int cfcContactId);

        Task<CfcContactPersonalMessage> SetPersonalMessage(CfcContactPersonalMessageChangeRequest request);
    }
}