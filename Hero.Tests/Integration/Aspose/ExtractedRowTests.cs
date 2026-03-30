using Hero.Integration.Aspose;

namespace Hero.Tests.Integration.Aspose;

public static class ExtractedRowTests
{
    [Test]
    [TestCase("TestColumn", "TestColumn")]
    [TestCase("TestColumn", "testColumn")]
    public static void Indexer_ShouldReturnCellValue(string columnName, string indexerValue)
    {
        var cellValue = new ExtractedCellValue
        {
            ColumnName = columnName,
            StringValue = "TestValue",
        };

        var row = new ExtractedRow
        {
            CellValues = new List<ExtractedCellValue> { cellValue },
        };

        ExtractedCellValue? result = row[indexerValue];

        result.Should().Be(cellValue);
    }

    [Test]
    public static void Indexer_ShouldReturnNull_WhenColumnNameDoesNotExist()
    {
        var row = new ExtractedRow
        {
            CellValues = new List<ExtractedCellValue>
            {
                new() { ColumnName = "Column1", StringValue = "Value1" },
            },
        };

        ExtractedCellValue? result = row["NonExistentColumn"];

        result.Should().BeNull();
    }

    [Test]
    public static void Indexer_ShouldReturnFirstMatch_WhenMultipleColumnsWithSameName()
    {
        var firstCell = new ExtractedCellValue
        {
            ColumnName = "DuplicateColumn",
            StringValue = "FirstValue",
        };

        var secondCell = new ExtractedCellValue
        {
            ColumnName = "DuplicateColumn",
            StringValue = "SecondValue",
        };

        var row = new ExtractedRow
        {
            CellValues = new List<ExtractedCellValue> { firstCell, secondCell },
        };

        ExtractedCellValue? result = row["DuplicateColumn"];

        result.Should().Be(firstCell);
    }

    [Test]
    public static void Indexer_ShouldReturnNull_WhenCellValuesIsEmpty()
    {
        var row = new ExtractedRow();

        ExtractedCellValue? result = row["AnyColumn"];

        result.Should().BeNull();
    }

    [Test]
    public static void CellValues_ShouldInitializeAsEmptyList()
    {
        var row = new ExtractedRow();

        row.CellValues.Should().NotBeNull();
        row.CellValues.Should().BeEmpty();
    }
}
