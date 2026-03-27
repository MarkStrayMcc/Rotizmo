using Aspose.Cells;

namespace Hero.Integration.Aspose;

internal sealed class AsposeRowExtractor : IAsposeRowExtractor
{
    public List<ExtractedRow> ExtractRows(Workbook workbook, ExtractorColumnConfiguration extractorColumnConfiguration, int sheetIndex = 0, bool checkForStringValues = true)
    {
        var workSheet = workbook.Worksheets[sheetIndex];

        var extractedRowsFromFirstWorkSheet = ExtractRowsFromWorkSheets(workSheet, extractorColumnConfiguration, checkForStringValues);

        return extractedRowsFromFirstWorkSheet;
    }

    private static List<ExtractedRow> ExtractRowsFromWorkSheets(Worksheet worksheet, ExtractorColumnConfiguration extractorColumnConfiguration, bool checkForStringValues)
    {
        var extractedRows = new List<ExtractedRow>();
        var rowNumber = 1;

        for (var rowIndex = extractorColumnConfiguration.InitialRowIndex;
             rowIndex <= worksheet.Cells.MaxDataRow;
             rowIndex++)
        {
            if (worksheet.Cells.CheckRow(rowIndex)?.IsBlank ?? false)
            {
                continue;
            }

            var extractedRow = new ExtractedRow();

            for (int i = 0; i < extractorColumnConfiguration.Columns.Count; i++)
            {
                ExtractorColumn column = extractorColumnConfiguration.Columns[i];
                int columnIndex = column.ColumnIndex ?? i;
                extractedRow.CellValues.Add(
                    GetCellValue(worksheet, rowIndex, columnIndex, column));
            }

            var isEmptyStringValueRow = checkForStringValues ? extractedRow.CellValues.All(x => string.IsNullOrWhiteSpace(x.StringValue)) : false;

            if (isEmptyStringValueRow)
            {
                continue;
            }

            extractedRow.RowNumber = rowNumber;

            extractedRows.Add(extractedRow);

            rowNumber++;
        }

        return extractedRows;
    }

    private static ExtractedCellValue GetCellValue(Worksheet worksheet, int rowIndex, int columnIndex,
        ExtractorColumn extractorColumn)
    {
        var cell = worksheet.Cells[rowIndex, columnIndex];

        var extractedCellValue = new ExtractedCellValue()
        {
            ColumnName = extractorColumn.ColumnName,
            ColumnIndex = columnIndex
        };

        switch (extractorColumn.DataType)
        {
            case ExtractorDataType.String:
                extractedCellValue.StringValue = GetStringData(cell);
                break;
            case ExtractorDataType.Double:
                extractedCellValue.DoubleValue = GetDoubleData(cell);
                break;
            case ExtractorDataType.Integer:
                extractedCellValue.IntegerValue = GetIntegerData(cell);
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }

        return extractedCellValue;
    }

    private static string GetStringData(Cell cell)
    {
        return cell.GetStringValue(CellValueFormatStrategy.None);
    }

    private static double? GetDoubleData(Cell cell)
    {
        return cell.Value != null ? cell.DoubleValue : null;
    }

    private static int? GetIntegerData(Cell cell)
    {
        return cell.Value != null ? cell.IntValue: null;
    }
}
