using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IClientNoteApi
    {
        Task<List<Models.ClientNote>> GetAsync(int clientId);

        Task<Models.ClientNote> AddAsync(Models.ClientNote clientNote);
    }
}