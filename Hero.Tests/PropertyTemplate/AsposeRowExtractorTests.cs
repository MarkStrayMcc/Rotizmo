using Hero.Integration.Aspose;
using TerrorConfig = Hero.Integration.Aspose.MultipleProperties.Terrorism.TemplateConfiguration;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public class AsposeRowExtractorTests
{
    private IAsposeRowExtractor _subject;

    [OneTimeSetUp]
    public void SetUp()
    {
        _subject = new AsposeRowExtractor();
    }

    [Test]
    public void GivenIHaveAnEmptyTemplate_WhenIExtractTheData_ThenIShouldHaveAnEmptyRowCollection()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplateEmpty.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);

        // Act
        var result = _subject.ExtractRows(workbook, TestColumnConfiguration.ColumnConfiguration);

        // Assert
        result.Should().NotBeNull();
        Assert.That(result.Count, Is.EqualTo(0));
    }

    [Test]
    public void GivenIHaveATemplate_WhenIExtractTheData_ThenIShouldHaveTheExpectedRowCollection()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplate.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);

        // Act
        var result = _subject.ExtractRows(workbook, TestColumnConfiguration.ColumnConfiguration);

        // Assert
        result.Count.Should().Be(3);
        result.Should().BeEquivalentTo(TestFixtures.StubListOfExtractedRowsForTemplate());
    }

    [Test]
    public void GivenIHaveATemplate_WhenIExtractTheData_ThenIShouldHaveCorrectCellCount()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplate.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);

        // Act
        var result = _subject.ExtractRows(workbook, TestColumnConfiguration.ColumnConfiguration);

        // Assert
        result.Count.Should().Be(3);
        result[0].CellValues.Count.Should().Be(16);
    }

    [Test]
    public void GivenIHaveATemplate_WhenIExtractTheDataForSpecificColumns_ThenIShouldHaveTheExpectedRowCollection()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplate.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);
        var columns = new List<ExtractorColumn>
        {
            new(TerrorConfig.Country, ExtractorDataType.String),
            new(TerrorConfig.AddressLine1, ExtractorDataType.String),
            new(TerrorConfig.County, ExtractorDataType.String, 5),
            new(TerrorConfig.Longitude, ExtractorDataType.Double, 8),
            new(TerrorConfig.ContentsDamageLimit, ExtractorDataType.Integer, 10),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        // Act
        var result = _subject.ExtractRows(workbook, config);

        // Assert
        result.Count.Should().Be(3);
        var expectedRow = TestFixtures.StubListOfExtractedRows().First();
        result.First().CellValues.Count.Should().Be(5);
        result.First().CellValues[0].Should().BeEquivalentTo(expectedRow.CellValues[0]);
        result.First().CellValues[1].Should().BeEquivalentTo(expectedRow.CellValues[1]);
        result.First().CellValues[2].Should().BeEquivalentTo(expectedRow.CellValues[5]);
        result.First().CellValues[3].Should().BeEquivalentTo(expectedRow.CellValues[8]);
    }

    [Test]
    public void GivenIHaveATemplate_WhenIExtractTheDataForSpecificColumns_ThenIShouldHaveCorrectCellCount()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplate.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);
        var columns = new List<ExtractorColumn>
        {
            new(TerrorConfig.Country, ExtractorDataType.String),
            new(TerrorConfig.AddressLine1, ExtractorDataType.String),
            new(TerrorConfig.County, ExtractorDataType.String, 5),
            new(TerrorConfig.Longitude, ExtractorDataType.Double, 8),
            new(TerrorConfig.ContentsDamageLimit, ExtractorDataType.Integer, 10),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        // Act
        var result = _subject.ExtractRows(workbook, config);

        // Assert
        result.Count.Should().Be(3);
        var expectedRow = TestFixtures.StubListOfExtractedRows().First();
        result.First().CellValues.Count.Should().Be(5);
        result[1].CellValues.Count.Should().Be(5);
        result[2].CellValues.Count.Should().Be(5);
    }

    [Test]
    public void GivenIHaveATemplate_WhenItContainsBlankRows_ThenOnlyPopulatedRowsShouldBeExtracted()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplateNumerics.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);

        // Act
        var rows = _subject.ExtractRows(workbook, TestColumnConfiguration.ColumnConfiguration);

        // Assert
        rows.Count.Should().Be(1);
    }

    [Test]
    public void GivenIHaveATemplate_WhenItContainsFormattedNumericValues_ThenTheValuesWillBeExtracted()
    {
        // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TestTerrorismTemplateNumerics.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);

        // Act
        var rows = _subject.ExtractRows(workbook, TestColumnConfiguration.ColumnConfiguration);

        // Assert
        rows.Count.Should().Be(1);
        var row = rows.First();

        row.CellValues[7].DoubleValue.Should().Be(123123.12);
        row.CellValues[8].DoubleValue.Should().Be(321321.32);
        row.CellValues[10].IntegerValue.Should().Be(804280);
        row.CellValues[14].IntegerValue.Should().Be(154457);
    }

    [Test]
    public void GivenIHaveATemplate_WhenItContainsARowWithNoFixedValues_ThenTheLocationWillStillBeExtracted(){
         // Arrange
        var directory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
        var path = Path.Combine(directory, "PropertyTemplate/TestTemplates/TerrorismMultiplePropertiesWithOneLocationWithoutFixedValues.xlsx");
        var workbook = new Aspose.Cells.Workbook(path);

        // Act
        var rows = _subject.ExtractRows(workbook, TestColumnConfiguration.ColumnConfiguration);

        // Assert
        rows.Count.Should().Be(2);
        var firstRow = rows.First();

        firstRow.CellValues[10].IntegerValue.Should().Be(300300000);
        firstRow.CellValues[11].IntegerValue.Should().Be(100000);
        firstRow.CellValues[12].IntegerValue.Should().Be(100000);
        firstRow.CellValues[13].IntegerValue.Should().Be(100000);
        firstRow.CellValues[14].IntegerValue.Should().Be(100000);
        firstRow.CellValues[15].IntegerValue.Should().Be(100000);

        var secondRow = rows[1];
        secondRow.CellValues[10].IntegerValue.Should().Be(null);
        secondRow.CellValues[11].IntegerValue.Should().Be(null);
        secondRow.CellValues[12].IntegerValue.Should().Be(null);
        secondRow.CellValues[13].IntegerValue.Should().Be(null);
        secondRow.CellValues[14].IntegerValue.Should().Be(null);
        secondRow.CellValues[15].IntegerValue.Should().Be(null);
    }
}
