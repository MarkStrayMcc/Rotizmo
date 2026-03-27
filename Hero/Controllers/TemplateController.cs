using System.ComponentModel.DataAnnotations;
using Aspose.Cells;
using Azure.Storage.Blobs.Models;
using Hero.Integration.Aspose.MultipleProperties;
using Hero.Integration.BlobStorage;
using Hero.Integration.Cache;
using Hero.Models;
using Hero.Models.Storage;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers;

[ApiController]
[Route("templates")]
public sealed class TemplateController : ControllerBase
{
    private const string PropertyTemplateContainerName = "hero-property-template";
    private const string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly IStorageService _storageService;
    private readonly IMultiplePropertyService _multiplePropertyService;
    private readonly ICacheHelper _cacheHelper;

    public TemplateController(IStorageService storageService, IMultiplePropertyService multiplePropertyService,ICacheHelper cacheHelper)
    {
        _storageService = storageService;
        _multiplePropertyService = multiplePropertyService;
        _cacheHelper = cacheHelper;
    }

    [HttpGet("property/{wordingVersionId:int}")]
    public async Task<IActionResult> GetPropertyTemplate(int wordingVersionId)
    {
        BlobDownloadStreamingResult? template = await _storageService.GetBlob(
            PropertyTemplateContainerName,
            GetTemplateBlobName(wordingVersionId));

        if (template is null)
            return NotFound();

        Response.Headers.Add("Content-Disposition", "attachment; filename=Hero-Property-Template.xlsx");

        return new FileStreamResult(template.Content, ContentType);
    }

    [HttpGet("GetMultiplePropertyBusinessLineProducts/{businessLineCode}")]
    public async Task<IActionResult> GetMultiplePropertyBusinessLineProducts(string businessLineCode)
    {
        var multiplePropertyBusinessLines = await _cacheHelper.RetrieveFromCache<MultiplePropertyBusinessLines>(businessLineCode);
        if (multiplePropertyBusinessLines is null)
        {
            multiplePropertyBusinessLines = await _storageService.GetMultiplePropertyBusinessLineProducts(businessLineCode);
            await _cacheHelper.SaveToCache(businessLineCode, multiplePropertyBusinessLines, 1);
        }
        return Ok(multiplePropertyBusinessLines);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(List<IFormFile> files, [FromForm] int clientId, [FromForm] int wordingVersionId)
    {
        await using var stream = files[0].OpenReadStream();
        TemplateUploadResult result = await _multiplePropertyService.GetPropertyLimits(stream, clientId, wordingVersionId);

        if (result.TemplateValidationError is not null)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("download/{wordingVersionId:int}")]
    public async Task<IActionResult> Download(int wordingVersionId, [Required] int quoteRef, int? firstLossLimit)
    {
        BlobDownloadStreamingResult? emptyTemplate = await _storageService.GetBlob(
            PropertyTemplateContainerName,
            GetTemplateBlobName(wordingVersionId));

        if (emptyTemplate is null)
            return NotFound();

        Workbook workbook = await _multiplePropertyService.InsertPropertyLimitsIntoWorkbook(
            quoteRef, wordingVersionId, firstLossLimit, emptyTemplate.Content);

        await using var stream = new MemoryStream();
        workbook.Save(stream, SaveFormat.Xlsx);
        byte[] data = stream.ToArray();
        return File(data, ContentType, $"terrorismSheet-{quoteRef}.xlsx");
    }

    private static string GetTemplateBlobName(int wordingVersionId) => $"Hero-Property-Template-{wordingVersionId}.xlsx";
}
