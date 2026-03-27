using Hero.Models;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IBordereauAPI
    {
        Task<BordereauClosedDateResponse> GetBordereauCloseDate();

        Task<bool> IsReceivedDateValid(string receivedDate);
    }
}