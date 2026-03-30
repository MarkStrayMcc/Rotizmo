using Aspose.Cells;
using Hero.Integration.Aspose;
using Hero.Integration.Aspose.MultipleProperties.Terrorism;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public class AsposeRowInserterTests
{
    private IAsposeRowInserter _subject;
    private List<ExtractedRow> _extractedLocationRows;
    private List<ExtractedRow> _extractedFloatingValueRows;
    private List<ExtractedRow> _extractedFirstLossLimitValueRows;

    [OneTimeSetUp]
    public void SetUp()
    {
        _subject = new AsposeRowInserter();
        _extractedLocationRows = TestFixtures.StubListOfExtractedRows();
        _extractedFloatingValueRows = TestFixtures.StubListOfExtractedRowsForFloatingValues();
        _extractedFirstLossLimitValueRows = TestFixtures.StubListOfExtractedRowsForFirstLossLimit(123000);
    }

    [Test]
    public void InsertRows_ReturnsPopulatedWorkbook()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory!, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        ExtractorColumnConfiguration locationConfig = TestColumnConfiguration.ColumnConfiguration;

        // Act
        _subject.InsertRows(workbook, _extractedLocationRows, locationConfig, 0);
        var extractedRowFirstCell = _extractedLocationRows[0].CellValues[0];
        var extractedRowFifthCell = _extractedLocationRows[0].CellValues[4];
        var extractedRowTenthCell = _extractedLocationRows[0].CellValues[9];

        var worksheet = workbook.Worksheets[0];
        var firstCell = worksheet.Cells[locationConfig.InitialRowIndex, 0];
        var fifthCell = worksheet.Cells[locationConfig.InitialRowIndex, 4];
        var tenthCell = worksheet.Cells[locationConfig.InitialRowIndex, 9];
        ExtractorDataType firstCellDataType = locationConfig.Columns[0].DataType;
        ExtractorDataType fifthCellDataType = locationConfig.Columns[4].DataType;
        ExtractorDataType tenthCellDataType = locationConfig.Columns[9].DataType;

        var firstCellValue = CellValue(firstCellDataType, firstCell);
        var fifthCellValue = CellValue(fifthCellDataType, fifthCell);
        var tenthCellValue = CellValue(tenthCellDataType, tenthCell);

        var extractedRowFirstCellValue = ExtractedRowCellValue(firstCellDataType, extractedRowFirstCell);
        var extractedRowFifthCellValue = ExtractedRowCellValue(fifthCellDataType, extractedRowFifthCell);
        var extractedRowTenthCellValue = ExtractedRowCellValue(tenthCellDataType, extractedRowTenthCell);

        // Assert
        firstCellValue.Should().NotBeNull();
        fifthCellValue.Should().NotBeNull();
        tenthCellValue.Should().NotBeNull();
        Assert.That(firstCellValue, Is.EqualTo(extractedRowFirstCellValue));
        Assert.That(fifthCellValue, Is.EqualTo(extractedRowFifthCellValue));
        Assert.That(tenthCellValue, Is.EqualTo(extractedRowTenthCellValue));
    }

    [Test]
    public void InsertFloatingValueRows_ReturnsPopulatedWorkbook()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory!, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        var floatingValueConfig = TemplateConfiguration.GetFloatingValuesColumnConfiguration();

        // Act
        _subject.InsertRows(workbook, _extractedFloatingValueRows, floatingValueConfig, 0);

        var extractedRowFirstCell = _extractedFloatingValueRows[0].CellValues[0];
        var extractedRowSecondCell = _extractedFloatingValueRows[0].CellValues[1];
        var extractedRowThirdCell = _extractedFloatingValueRows[0].CellValues[2];

        var worksheet = workbook.Worksheets[0];
        var firstCell = worksheet.Cells[floatingValueConfig.InitialRowIndex, 0];
        var secondCell = worksheet.Cells[floatingValueConfig.InitialRowIndex, 1];
        var thirdCell = worksheet.Cells[floatingValueConfig.InitialRowIndex, 2];
        ExtractorDataType firstCellDataType = floatingValueConfig.Columns[0].DataType;
        ExtractorDataType secondCellDataType = floatingValueConfig.Columns[1].DataType;
        ExtractorDataType thirdCellDataType = floatingValueConfig.Columns[2].DataType;

        var firstCellValue = CellValue(firstCellDataType, firstCell);
        var secondCellValue = CellValue(secondCellDataType, secondCell);
        var thirdCellValue = CellValue(thirdCellDataType, thirdCell);

        var extractedRowFirstCellValue = ExtractedRowCellValue(firstCellDataType, extractedRowFirstCell);
        var extractedRowSecondCellValue = ExtractedRowCellValue(secondCellDataType, extractedRowSecondCell);
        var extractedRowThirdCellValue = ExtractedRowCellValue(thirdCellDataType, extractedRowThirdCell);

        // Assert
        firstCellValue.Should().NotBeNull();
        secondCellValue.Should().NotBeNull();
        thirdCellValue.Should().NotBeNull();
        Assert.That(firstCellValue, Is.EqualTo(extractedRowFirstCellValue));
        Assert.That(secondCellValue, Is.EqualTo(extractedRowSecondCellValue));
        Assert.That(thirdCellValue, Is.EqualTo(extractedRowThirdCellValue));
    }

    [Test]
    public void InsertFirstLossLimitValueRows_ReturnsPopulatedWorkbook()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory!, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        var firstLossLimitValueConfig = TemplateConfiguration.GetFirstLossLimitColumnConfiguration();

        // Act
        _subject.InsertRows(workbook, _extractedFirstLossLimitValueRows, firstLossLimitValueConfig, 0);

        var extractedRowFirstCell = _extractedFirstLossLimitValueRows[0].CellValues[0];

        var worksheet = workbook.Worksheets[0];
        var firstCell = worksheet.Cells[firstLossLimitValueConfig.InitialRowIndex, 0];
        ExtractorDataType firstCellDataType = firstLossLimitValueConfig.Columns[0].DataType;

        var firstCellValue = CellValue(firstCellDataType, firstCell);

        var extractedRowFirstCellValue = ExtractedRowCellValue(firstCellDataType, extractedRowFirstCell);

        // Assert
        firstCellValue.Should().NotBeNull();
        Assert.That(firstCellValue, Is.EqualTo(extractedRowFirstCellValue));
    }


    [Test]
    public void InsertRows_HasCorrectCellCount()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory!, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Workbook(path);
        ExtractorColumnConfiguration locationConfig = TestColumnConfiguration.ColumnConfiguration;

        // Act
        _subject.InsertRows(workbook, _extractedLocationRows, locationConfig, 0);

        Assert.That(_extractedLocationRows[0].CellValues.Count, Is.EqualTo(16));
    }

    private static string? ExtractedRowCellValue(ExtractorDataType cellDataType, ExtractedCellValue extractedRowCell)
    {
        return cellDataType == ExtractorDataType.String ? extractedRowCell.StringValue :
            (cellDataType == ExtractorDataType.Double ? extractedRowCell.DoubleValue : extractedRowCell.IntegerValue).ToString();
    }

    private static string CellValue(ExtractorDataType cellDataType, Cell cell)
    {
        return cellDataType == ExtractorDataType.String ? cell.StringValue :
            (cellDataType == ExtractorDataType.Double ? cell.DoubleValue : cell.IntValue).ToString();
    }
}
