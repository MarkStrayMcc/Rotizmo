using Aspose.Cells;
using Hero.Models;

namespace Hero.Integration.Aspose.MultipleProperties;

public interface IMultiplePropertyService
{
    Task<TemplateUploadResult> GetPropertyLimits(Stream inputFileStream, int clientId, int wordingVersionId);

    Task<Workbook> InsertPropertyLimitsIntoWorkbook(int quoteRef, int wordingVersionId, int? firstLossLimit, Stream inputFileStream);
}
