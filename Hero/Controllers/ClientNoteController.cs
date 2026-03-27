using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class ClientNoteController : Controller
    {

        private readonly IClientNoteApi _clientNoteApi;

        public ClientNoteController(IClientNoteApi clientNoteApi)
        {
            _clientNoteApi = clientNoteApi;
        }

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> Get(int clientId)
        {
            var notes = await _clientNoteApi.GetAsync(clientId);
            
            return Ok(notes);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> Add([FromBody] Models.ClientNote clientNote)
        {
            var savedClientNote = await _clientNoteApi.AddAsync(clientNote);

            return Ok(savedClientNote);
        }
    }
}
