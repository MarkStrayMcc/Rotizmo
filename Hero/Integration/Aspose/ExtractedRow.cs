namespace Hero.Integration.Aspose;

public sealed class ExtractedRow
{
    public IList<ExtractedCellValue> CellValues { get; init; } = new List<ExtractedCellValue>();

    public ExtractedCellValue? this[string columnName] => CellValues.FirstOrDefault(
        cellValue => cellValue.ColumnName.Equals(columnName, StringComparison.OrdinalIgnoreCase));

    public int RowNumber { get; set; }
}
