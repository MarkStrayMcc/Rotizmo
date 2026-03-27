using Aspose.Cells;

namespace Hero.Integration.Aspose;

internal interface IAsposeRowInserter
{
    void InsertRows(Workbook workbook, List<ExtractedRow> extractedRows, ExtractorColumnConfiguration extractorColumnConfiguration, int sheetIndex);
}
