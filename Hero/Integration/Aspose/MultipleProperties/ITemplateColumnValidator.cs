using Aspose.Cells;

namespace Hero.Integration.Aspose.MultipleProperties;

internal interface ITemplateColumnValidator
{
    (bool isValid, string error) Validate(Worksheet worksheet, ExtractorColumnConfiguration expectedConfig);
}
