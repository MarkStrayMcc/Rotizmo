using Aspose.Cells;

namespace Hero.Integration.Aspose;

internal interface IAsposeRowExtractor
{
    List<ExtractedRow> ExtractRows(Workbook workbook, ExtractorColumnConfiguration extractorColumnConfiguration, int sheetIndex = 0, bool checkForStringValues = true);
}
