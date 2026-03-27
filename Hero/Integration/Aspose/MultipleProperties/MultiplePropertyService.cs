using Aspose.Cells;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;

namespace Hero.Integration.Aspose.MultipleProperties;

public class MultiplePropertyService : IMultiplePropertyService
{
    private readonly IMultiplePropertyOrchestrator _multiplePropertyOrchestrator;
    private readonly IPropertyLimitsApi _propertyLimitsApi;
    private readonly IQuoteApi _quoteApi;

    // In future, when multiple Products, apply strategy.
    public MultiplePropertyService(IMultiplePropertyOrchestrator multiplePropertyOrchestrator, IPropertyLimitsApi propertyLimitsApi, IQuoteApi quoteApi)
    {
        _multiplePropertyOrchestrator = multiplePropertyOrchestrator;
        _propertyLimitsApi = propertyLimitsApi;
        _quoteApi = quoteApi;
    }
    public async Task<TemplateUploadResult> GetPropertyLimits(Stream inputFileStream, int clientId, int wordingVersionId)
    {
        var workbook = new Workbook(inputFileStream);
        return await _multiplePropertyOrchestrator.GetPropertyLimitsAsync(workbook, clientId, wordingVersionId);
    }

    public async Task<Workbook> InsertPropertyLimitsIntoWorkbook(int quoteRef, int wordingVersionId, int? firstLossLimit, Stream inputFileStream)
    {
        var quote = await _quoteApi.GetQuoteAsync(quoteRef);
        var workbook = new Workbook(inputFileStream);

        return await _multiplePropertyOrchestrator.InsertPropertyLimitsIntoWorkbook(
            workbook,
            quote?.PropertyLimits,
            quote?.PropertyLimitFloatingValues,
            firstLossLimit,
            wordingVersionId);
    }
}
