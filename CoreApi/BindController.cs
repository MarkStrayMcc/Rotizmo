using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using CFC.CoreApi.WebApi.CustomAttributes;
using Cfc.Policy.Contracts.Bind;
using MediatR;
using Swashbuckle.Swagger.Annotations;
using BindRequest = CFC.CoreApi.WebApi.Dto.Policy.Bind.BindRequest;

namespace CFC.CoreApi.WebApi.Controllers.Policy
{
    /// <summary>
    /// Controller for managing a quote
    /// </summary>
    public class BindController : ApiController
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;

        public BindController(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }
        
        /// <summary>
        /// Binds an existing quote
        /// </summary>
        /// <param name="request">QuoteBindRequest object</param>
        /// <returns>Policy number populated if successful, error message if not</returns>
        [HttpPost]
        [Route("api/quote/{quoteReference}/bind")]
        [ApiVersion("policy")]
        [SwaggerResponse(HttpStatusCode.OK, Type = typeof(BindResponse))]
        public async Task<IHttpActionResult> Bind(int quoteReference, BindRequest request)
        {
            var message = _mapper.Map<Cfc.Policy.Contracts.Bind.BindRequest>(request);

            message.CfcUserEmailAddress = Request.GetCfcEmailHeaderValue();
            message.QuoteReference = quoteReference;
            var result = await _mediator.Send(message);

            return Ok(_mapper.Map<BindResponse>(result));
        }
    }
}