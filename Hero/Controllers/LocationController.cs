using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;
using WebApiDto.Dto;

namespace Hero.Controllers
{
    public class LocationController : Controller
    {
        private readonly ILocationApi _locationApi;

        public LocationController(ILocationApi locationApi)
        {
            _locationApi = locationApi;
        }

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetClientLocations(int clientId)
        {
            var locations = await _locationApi.GetAsync(clientId);
            return Ok(locations);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> AddLocation([FromBody] ClientLocation clientLocation)
        {
            MessageResult message = new MessageResult();
            try
            {
                message = await _locationApi.AddAsync(clientLocation);
            }catch(Exception ex)
            {
                message.Message = ex.Message;
            }

            return Ok(message);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> EditLocation([FromBody] ClientLocation clientLocation)
        {
            MessageResult message = new MessageResult();
            try
            {
                message = await _locationApi.UpdateAsync(clientLocation);
            }
            catch (Exception ex)
            {
                message.Message = ex.Message;
            }

            return Ok(message);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> DeleteLocation([FromBody] ClientLocation clientLocation)
        {
            MessageResult message = new MessageResult();
            try
            {
                message = await _locationApi.DeleteAsync(clientLocation);
            }
            catch (Exception ex)
            {
                message.Message = ex.Message;
            }

            return Ok(message);
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetPlaceDetailsAddress(string placeId)
        {
      
            var result = await _locationApi.GetPlaceDetailsAddressAsync(placeId);
            return Ok(result);

        }
    }
}
