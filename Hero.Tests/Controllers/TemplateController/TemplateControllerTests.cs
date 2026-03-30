using System.Text;
using Aspose.Cells;
using Azure.Storage.Blobs.Models;
using Hero.Integration.Aspose.MultipleProperties;
using Hero.Integration.BlobStorage;
using Hero.Integration.Cache;
using Hero.Models;
using Hero.Models.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Tests.Controllers.TemplateController;

[TestFixture]
public sealed class TemplateControllerTests
{
    private readonly IStorageService _storageService = Substitute.For<IStorageService>();
    private readonly IMultiplePropertyService _multiplePropertyService = Substitute.For<IMultiplePropertyService>();
    private readonly ICacheHelper _cacheHelper = Substitute.For<ICacheHelper>();
    private Hero.Controllers.TemplateController? _subject;

    [SetUp]
    public void SetUp()
    {
        _subject = new Hero.Controllers.TemplateController(_storageService, _multiplePropertyService, _cacheHelper);
    }

    [Test]
    public async Task GetMultiplePropertyBusinessLineProducts_WhenCalled_ReturnsOkObjectResult()
    {
        // Arrange
        const string businessLines = "TR";
        var expected = new MultiplePropertyBusinessLines
        {
            BusinessLine = "TR",
            Products = new List<Models.Product>
            {
                new Models.Product
                {
                    ProductName = "T&S"
                },
                new Models.Product
                {
                    ProductName = "PV"
                }
            }
        };
        _storageService.GetMultiplePropertyBusinessLineProducts(Arg.Any<string>()).Returns(expected);

        // Act
        var result = await _subject.GetMultiplePropertyBusinessLineProducts(businessLines);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<MultiplePropertyBusinessLines>().Subject;
        actual.Should().BeEquivalentTo(expected);
    }

    [Test]
    public async Task Download_TemplateNotFound_ReturnsNotFoundObjectResult()
    {
        _storageService.GetBlob(Arg.Any<string>(), Arg.Any<string>())
            .Returns((BlobDownloadStreamingResult?)null);

        IActionResult result = await _subject!.Download(789, 123, 456);

        result.Should().NotBeNull();
        result.Should().BeOfType<NotFoundResult>();
    }

    [Test]
    public async Task Download_TemplateFound_ReturnsExpectedResult()
    {
        const int quoteRef = 123;
        const int firstLossLimit = 456;
        const int wordingVersionId = 789;

        _subject!.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        using var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes("Hello, World!"));
        BlobDownloadStreamingResult? blobResult = BlobsModelFactory.BlobDownloadStreamingResult(memoryStream);
        _storageService.GetBlob(Arg.Any<string>(), Arg.Is($"Hero-Property-Template-{wordingVersionId}.xlsx"))
            .Returns(blobResult);

        using var workbook = new Workbook();
        _multiplePropertyService
            .InsertPropertyLimitsIntoWorkbook(quoteRef, wordingVersionId, firstLossLimit, Arg.Is(blobResult.Content))
            .Returns(workbook);

        IActionResult result = await _subject!.Download(wordingVersionId, quoteRef, firstLossLimit);

        result.Should().NotBeNull();
        result.Should().BeOfType<FileContentResult>();
    }

    [Test]
    public async Task GetPropertyTemplate_TemplateNotFound_ReturnsNotFoundObjectResult()
    {
        _storageService.GetBlob(Arg.Any<string>(), Arg.Any<string>())
            .Returns((BlobDownloadStreamingResult?)null);

        IActionResult result = await _subject!.GetPropertyTemplate(789);

        result.Should().NotBeNull();
        result.Should().BeOfType<NotFoundResult>();
    }

    [Test]
    public async Task GetPropertyTemplate_TemplateFound_ReturnsExpectedResult()
    {
        const int wordingVersionId = 789;

        _subject!.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        using var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes("Hello, World!"));
        BlobDownloadStreamingResult? blobResult = BlobsModelFactory.BlobDownloadStreamingResult(memoryStream);

        _storageService.GetBlob(Arg.Any<string>(), Arg.Is($"Hero-Property-Template-{wordingVersionId}.xlsx"))
            .Returns(blobResult);

        IActionResult result = await _subject!.GetPropertyTemplate(wordingVersionId);

        result.Should().NotBeNull();
        result.Should().BeOfType<FileStreamResult>();
    }

    [Test]
    public async Task GetPropertyTemplate_TemplateFound_SetsExpectedHeader()
    {
        const int wordingVersionId = 789;

        _subject!.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        using var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes("Hello, World!"));
        BlobDownloadStreamingResult? blobResult = BlobsModelFactory.BlobDownloadStreamingResult(memoryStream);

        _storageService.GetBlob(Arg.Any<string>(), Arg.Is($"Hero-Property-Template-{wordingVersionId}.xlsx"))
            .Returns(blobResult);

        _ = await _subject!.GetPropertyTemplate(wordingVersionId);

        string? header = _subject.Response.Headers["Content-Disposition"].ToString();
        header.Should().Be("attachment; filename=Hero-Property-Template.xlsx");
    }

    [Test]
    public async Task Upload_WhenCalled_ReturnsOkObjectResult()
    {
        // Arrange
        const int clientId = 1234;
        const int wordingVersionId = 4567;
        var file = Substitute.For<IFormFile>();
        var formFiles = new List<IFormFile>()
        {
            file
        };
        var expectedResult = new TemplateUploadResult();

        _multiplePropertyService.GetPropertyLimits(Arg.Any<Stream>(), clientId, wordingVersionId)
            .Returns(expectedResult);

        // Act
        var response = await _subject.Upload(formFiles, clientId, wordingVersionId);

        // Assert
        response.Should().BeOfType<OkObjectResult>();
        var okResult = response as OkObjectResult;
        okResult.Value.Should().Be(expectedResult);
    }

    [Test]
    public async Task Upload_WhenTemplateValidationFails_ReturnsBadRequestObjectResult()
    {
        const int clientId = 1234;
        const int wordingVersionId = 4567;

        var file = Substitute.For<IFormFile>();
        var formFiles = new List<IFormFile> { file };
        var expectedResult = new TemplateUploadResult { TemplateValidationError = "Template validation error" };

        _multiplePropertyService.GetPropertyLimits(Arg.Any<Stream>(), clientId, wordingVersionId)
            .Returns(expectedResult);

        IActionResult response = await _subject.Upload(formFiles, clientId, wordingVersionId);

        response.Should().BeOfType<BadRequestObjectResult>();
        response.As<BadRequestObjectResult>().Value.Should().Be(expectedResult);
    }
}
