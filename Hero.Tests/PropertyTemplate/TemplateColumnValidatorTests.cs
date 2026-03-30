using Aspose.Cells;
using Hero.Integration.Aspose;
using Hero.Integration.Aspose.MultipleProperties;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Testing;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public static class TemplateColumnValidatorTests
{
    [Test]
    public static void Validate_WhenAllColumnsMatch_ReturnsExpectedResult()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
            new("Amount", ExtractorDataType.Integer),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue("City");
        worksheet.Cells[1, 2].PutValue("Amount");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeTrue();
        error.Should().BeNullOrEmpty();
    }

    [Test]
    public static void Validate_WhenColumnNameIsCaseDifferent_ReturnsNull()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("COUNTRY");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeTrue();
        error.Should().BeNullOrEmpty();
    }

    [Test]
    public static void Validate_WhenColumnsHaveExtraSpaces_ReturnsNull()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("  Country  ");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeTrue();
        error.Should().BeNullOrEmpty();
    }

    [Test]
    public static void Validate_WhenDisplayNameMatchesHeader_ReturnsNull()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("PostCode", ExtractorDataType.String) { DisplayName = "Post Code" },
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Post Code*");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeTrue();
        error.Should().BeNullOrEmpty();
    }

    [Test]
    public static void Validate_WhenColumnIsMissing_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenColumnsAreMisplaced_ReturnsMisplacedError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
            new("Amount", ExtractorDataType.Integer),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue("Amount");
        worksheet.Cells[1, 2].PutValue("City");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenColumnIsEmpty_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue(string.Empty);

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenColumnIsWhitespaceOnly_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("   ");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenColumnNameMismatches_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Nation");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenExtraColumnExists_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue("ExtraColumn");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenMismatch_Logs()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
        };

        var logger = new FakeLogger<TemplateColumnValidator>();
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 2].PutValue("ExtraColumn");

        var validator = new TemplateColumnValidator(logger);

        _ = validator.Validate(worksheet, config);

        logger.Collector.Count.Should().Be(1);
        logger.LatestRecord.Level.Should().Be(LogLevel.Error);
        logger.LatestRecord.Message.Should().StartWith(TemplateColumnValidator.TemplateMismatch);
        logger.LatestRecord.Message.Should().Contain("Actual columns do not match expected columns");
        logger.LatestRecord.Message.Should().Contain("Expected: \"Country\", \"City\"; Actual: \"Country\", \"\", \"ExtraColumn\"");
    }

    [Test]
    public static void Validate_WhenMultipleExtraColumnsExist_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue("Extra1");
        worksheet.Cells[1, 2].PutValue("Extra2");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenBothMissingAndExtraColumns_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 2].PutValue("ExtraColumn");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenHeaderRowIndexIsNegative_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 0);

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Contain("Invalid configuration");
        error.Should().Contain("header row index");
    }

    [Test]
    public static void Validate_WhenColumnIndexIsSpecified_UsesSpecifiedIndex()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String, 1),
            new("City", ExtractorDataType.String, 0),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("City");
        worksheet.Cells[1, 1].PutValue("Country");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeTrue();
        error.Should().BeNullOrEmpty();
    }

    [Test]
    public static void Validate_WhenColumnIndexIsSpecifiedButMisplaced_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String, 2) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenExtraColumnsAreEmptyOrWhitespace_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue(string.Empty);
        worksheet.Cells[1, 2].PutValue("   ");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenMultipleMissingColumns_ListsAllMissing()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
            new("Amount", ExtractorDataType.Integer),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 1].PutValue("City");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenWorksheetHasNoData_ReturnsErrorForMissingColumns()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn> { new("Country", ExtractorDataType.String) };
        var config = new ExtractorColumnConfiguration(columns, 2);

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenWorksheetHasDuplicateHeaders_ReturnsError()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue("City");
        worksheet.Cells[1, 2].PutValue("Country");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }

    [Test]
    public static void Validate_WhenWorksheetHasMultipleDuplicateHeaders_ReturnsErrorListingAll()
    {
        using var workbook = new Workbook();
        Worksheet? worksheet = workbook.Worksheets[0];
        var columns = new List<ExtractorColumn>
        {
            new("Country", ExtractorDataType.String),
            new("City", ExtractorDataType.String),
        };

        var config = new ExtractorColumnConfiguration(columns, 2);

        worksheet.Cells[1, 0].PutValue("Country");
        worksheet.Cells[1, 1].PutValue("City");
        worksheet.Cells[1, 2].PutValue("Country");
        worksheet.Cells[1, 3].PutValue("City");

        var validator = new TemplateColumnValidator(new FakeLogger<TemplateColumnValidator>());

        (bool isValid, string error) = validator.Validate(worksheet, config);

        isValid.Should().BeFalse();
        error.Should().Be(TemplateColumnValidator.TemplateMismatch);
    }
}
