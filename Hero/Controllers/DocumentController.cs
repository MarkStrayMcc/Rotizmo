using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.DDPTApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using WebApiDto.Dto.DDPT;
using WebApiDto.Enum;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Hero.Controllers {
    public class DocumentController : Controller {
        private readonly IQuoteApi _quoteApi;
        private readonly IEndorsementApi _endorsementApi;
        private readonly IWordingVersionsApi _wordingVersionsApi;

        public DocumentController (
            IQuoteApi quoteApi,
            IEndorsementApi endorsementApi, 
            IWordingVersionsApi wordingVersionsApi) 
        {
            _quoteApi = quoteApi;
            _endorsementApi = endorsementApi;
            _wordingVersionsApi = wordingVersionsApi;
        }

        [HttpGet ("[controller]/{format}/quote/{quoteId}")]
        public async Task<IActionResult> GetQuote (int quoteId, string format) {
            try {
                var documentResult = await _quoteApi.RequestQuoteDocumentAsync (quoteId, format);
                return GetFileContentResult (documentResult);
            } catch (Exception e) {
                return StatusCode ((int) HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet ("[controller]/{format}/policy/{policyNumber}")]
        public async Task<IActionResult> GetPolicy (string policyNumber, string format) {
            try {
                var documentResult = await _quoteApi.RequestPolicyDocumentAsync (policyNumber, format);
                return GetFileContentResult (documentResult);
            } catch (Exception e) {
                return StatusCode ((int) HttpStatusCode.InternalServerError, "Error generating the document: " + e.Message);
            }
        }

        [HttpGet ("[controller]/{fileFormat}/{wordingVersionId}/{countryIsoCode}/{brokerTeamId}")]
        public async Task<IActionResult> GetWording(string fileFormat, int wordingVersionId, string countryIsoCode, int brokerTeamId, string productCode, 
            string stateProvinceCode, bool isAdmitted = false, string cfcTeamCoverholder = null)
        {
            try
            {
                var documentResult = await _wordingVersionsApi.GetDocument(fileFormat, wordingVersionId, countryIsoCode,
                    brokerTeamId, productCode, stateProvinceCode, isAdmitted, cfcTeamCoverholder);

                return GetFileContentResult (documentResult);
            } 
            catch (Exception e)
            {
                return StatusCode ((int) HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet ("[controller]/{format}/endorsement/{documentVersionId}/{policyNumber}/{inceptionDate}/{insured}")]
        public async Task<IActionResult> GetEndorsement (string format, int documentVersionId, string policyNumber, DateTime inceptionDate, string insured) {
            try {
                var mergeFields = new Dictionary<string, string> ()
                { 
                    { "POLICYNUMBER", string.IsNullOrEmpty (policyNumber) ? " " : policyNumber },
                    { "INSURED", insured },
                    { "INCEPTIONDATE", inceptionDate.ToLongDateString () }
                };

                var request = new Models.EndorsementRequest () {
                    DocumentVersionId = documentVersionId,
                    FileFormat = Enum.TryParse (format, true, out FileFormat fileFormat) ? fileFormat : FileFormat.Pdf,
                    MergeFields = mergeFields,
                    IsDraft = true
                };

                var documentResult = await _endorsementApi.GetDocument (request);
                return GetFileContentResult (documentResult);
            } catch (Exception e) {
                return StatusCode ((int) HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet ("[controller]/{format}/endorsement/{documentVersionId}/{inceptionDate}/{insured}")]
        public Task<IActionResult> GetEndorsement (string format, int documentVersionId, DateTime inceptionDate, string insured) {
            return this.GetEndorsement (format, documentVersionId, null, inceptionDate, insured);
        }

        private FileContentResult GetFileContentResult(DocumentResult result) {
            var response = File (result.Data, "application/octet-stream");
            var fileName = Path.GetFileNameWithoutExtension (result.FileName);
            var extension = Path.GetExtension (result.FileName).ToLower ();
            response.FileDownloadName = fileName + extension;
            return response;
        }

    }
}