using Aspose.Cells;

namespace Hero.Integration.Aspose;

internal sealed class AsposeRowInserter : IAsposeRowInserter
{
    public void InsertRows(Workbook workbook, List<ExtractedRow> extractedRows, ExtractorColumnConfiguration extractorColumnConfiguration, int sheetIndex)
    {
        var rowIndex = extractorColumnConfiguration.InitialRowIndex;
        var worksheet = workbook.Worksheets[sheetIndex];
        foreach (var row in extractedRows)
        {
            foreach (var cellValue in row.CellValues)
            {
                var cell = worksheet.Cells[rowIndex, cellValue.ColumnIndex];

                if (cellValue.IntegerValue.HasValue) cell.PutValue(cellValue.IntegerValue.Value);
                else if (cellValue.DoubleValue.HasValue) cell.PutValue(cellValue.DoubleValue.Value);
                else cell.PutValue(cellValue.StringValue);
            }
            rowIndex++;
        }
    }
}
