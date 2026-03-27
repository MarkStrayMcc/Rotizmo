using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class ClientNoteApi : BaseApi, IClientNoteApi
    {
        private string _clientNoteGetUrl;
        private string _clientNoteAddUrl;


        public ClientNoteApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _clientNoteGetUrl = _configuration["CoreApi:ClientNoteGet"];
            _clientNoteAddUrl = _configuration["CoreApi:ClientNoteAdd"];
        }

        public async Task<Models.ClientNote> AddAsync(Models.ClientNote clientNote)
        {
            var note = await PostAsyncTyped<Models.ClientNote, ClientNote>(_clientNoteAddUrl, clientNote);

            return new Models.ClientNote(note);
        }

        public async Task<List<Models.ClientNote>> GetAsync(int clientId)
        {
            var notes = await GetAsyncTyped<List<ClientNote>>(string.Format("{0}/{1}", _clientNoteGetUrl, clientId));
            return notes.Select(n => new Models.ClientNote(n)).ToList();
        }
    }
}
