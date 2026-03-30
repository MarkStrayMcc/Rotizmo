using Aspose.Cells;
using Hero.Integration.Aspose.MultipleProperties;
using Hero.Integration.CoreApi.Interfaces;
using PropertyLimitFloatingValues = WebApiDto.Dto.PropertyLimitFloatingValues;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public class MultiplePropertyServiceTests
{
    private readonly string excelFilePath = "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx";
    [Test]
    public async Task ShouldCallGetProperyLimitsAsync()
    {
        var multiplePropertyOrchestrator = Substitute.For<IMultiplePropertyOrchestrator>();
        var propertyLimitsApi = Substitute.For<IPropertyLimitsApi>();
        var quoteApi = Substitute.For<IQuoteApi>();

        var workbookStream = CreateTestWorkbookStream(excelFilePath);
        var multiplePropertyService = new MultiplePropertyService(multiplePropertyOrchestrator, propertyLimitsApi, quoteApi);

        var result = await multiplePropertyService.GetPropertyLimits(workbookStream, 1, 1);

        await multiplePropertyOrchestrator.Received().GetPropertyLimitsAsync(Arg.Any<Workbook>(), Arg.Any<int>(), Arg.Any<int>());
        await propertyLimitsApi.DidNotReceive().GetPropertyLimits(Arg.Any<int>());
    }

    [Test]
    public async Task ShouldCallInsertPropertyLimitsIntoWorkbook()
    {
        var multiplePropertyOrchestrator = Substitute.For<IMultiplePropertyOrchestrator>();
        var propertyLimitsApi = Substitute.For<IPropertyLimitsApi>();
        var quoteApi = Substitute.For<IQuoteApi>();

        var workbookStream = CreateTestWorkbookStream(excelFilePath);

        var multiplePropertyService = new MultiplePropertyService(multiplePropertyOrchestrator, propertyLimitsApi, quoteApi);

        _ = await multiplePropertyService.InsertPropertyLimitsIntoWorkbook(123, 1, null, workbookStream);

        await multiplePropertyOrchestrator.Received().InsertPropertyLimitsIntoWorkbook(
            Arg.Any<Workbook>(),
            Arg.Any<IEnumerable<WebApiDto.Dto.PropertyLimit>>(),
            Arg.Any<PropertyLimitFloatingValues>(),
            Arg.Any<int?>(),
            Arg.Any<int>());
    }

    [Test]
    public async Task ShouldFailForLimitValuesMoreThan300M()
    {
        var multiplePropertyOrchestrator = Substitute.For<IMultiplePropertyOrchestrator>();
        var propertyLimitsApi = Substitute.For<IPropertyLimitsApi>();
        var quoteApi = Substitute.For<IQuoteApi>();

        var tivValidationExcelFilePath = "PropertyTemplate/TestTemplates/TestTerrorismTemplateForTIVValidation.xlsx";
        var workbookStream = CreateTestWorkbookStream(tivValidationExcelFilePath);
        var multiplePropertyService = new MultiplePropertyService(multiplePropertyOrchestrator, propertyLimitsApi, quoteApi);

        var result = await multiplePropertyService.GetPropertyLimits(workbookStream, 1, 1);

        await multiplePropertyOrchestrator.Received().GetPropertyLimitsAsync(Arg.Any<Workbook>(), Arg.Any<int>(), Arg.Any<int>());
        await propertyLimitsApi.DidNotReceive().GetPropertyLimits(Arg.Any<int>());
    }

    private static MemoryStream CreateTestWorkbookStream(string filePath)
    {
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, filePath);
        using var file = File.Open(path, FileMode.Open);
        var memoryStream = new MemoryStream();
        file.CopyTo(memoryStream);
        memoryStream.Position = 0;

        return memoryStream;
    }
}
