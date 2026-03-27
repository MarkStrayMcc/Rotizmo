using Aspose.Cells;
using Hero.Models;
using WebApiDto.Dto;

namespace Hero.Integration.Aspose.MultipleProperties;

public interface IMultiplePropertyOrchestrator
{
    Task<TemplateUploadResult> GetPropertyLimitsAsync(Workbook workbook, int clientId, int wordingVersionId);

    Task<Workbook> InsertPropertyLimitsIntoWorkbook(
        Workbook workbook,
        IEnumerable<WebApiDto.Dto.PropertyLimit> propertyLimits,
        PropertyLimitFloatingValues propertyLimitFloatingValues,
        int? firstLossLimit,
        int wordingVersionId);
}
