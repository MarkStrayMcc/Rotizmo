using System.Diagnostics.CodeAnalysis;
using Hero.Integration.Aspose;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public static class ExtractorColumnTests
{
    [Test]
    [TestCase(null)]
    [TestCase("")]
    [TestCase("\t")]
    public static void Constructor_WhenColumnNameIsNull_ThrowsArgumentNullException(string? columnName)
    {
        Action act = () => _ = new ExtractorColumn(columnName!, ExtractorDataType.String);

        act.Should().Throw<ArgumentException>();
    }

    [Test]
    public static void DisplayName_WhenNull_FallsBackToTrimmedColumnName()
    {
        var column = new ExtractorColumn("Test\t", ExtractorDataType.String);

        column.DisplayName.Should().Be("Test");
    }

    [Test]
    [TestCase(null)]
    [TestCase("")]
    [TestCase("\t")]
    public static void DisplayName_WhenExplicitlySetToNullOrWhiteSpace_FallsBackToTrimmedColumnName(string? displayName)
    {
        var column = new ExtractorColumn("Test\t", ExtractorDataType.String) { DisplayName = displayName! };

        column.DisplayName.Should().Be("Test");
    }

    [Test]
    public static void DisplayName_WhenInitialized_TrimsValue()
    {
        const string displayName = "Display";

        var column = new ExtractorColumn("Name", ExtractorDataType.String) { DisplayName = $"\t{displayName}\t" };

        column.DisplayName.Should().Be(displayName);
    }

    [Test]
    public static void Equals_WhenObjectsAreSame_ReturnsTrue()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("test", ExtractorDataType.String, 1);

        column1.Equals(column2).Should().BeTrue();
    }

    [Test]
    public static void GetHashCode_WhenObjectsHaveIdenticalValues_ReturnsSameHashCode()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("test", ExtractorDataType.String, 1);

        column1.GetHashCode().Should().Be(column2.GetHashCode());
    }

    [Test]
    public static void GetHashCode_WhenObjectsHaveDifferentValues_ReturnsDifferentHashCode()
    {
        var column1 = new ExtractorColumn("Test1", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("Test2", ExtractorDataType.String, 1);

        column1.GetHashCode().Should().NotBe(column2.GetHashCode());
    }

    [Test]
    public static void Equals_WhenObjectsAreDifferent_ReturnsFalse()
    {
        var column1 = new ExtractorColumn("Test1", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("Test2", ExtractorDataType.String, 1);

        column1.Equals(column2).Should().BeFalse();
    }

    [Test]
    [SuppressMessage("Maintainability", "CA1508:Avoid dead conditional code", Justification = "Equality implementation test")]
    public static void Equals_WhenOtherIsNull_ReturnsFalse()
    {
        var column1 = new ExtractorColumn("Test1", ExtractorDataType.String, 1);

        column1.Equals(null).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenObjectsAreSameReference_ReturnsTrue()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String, 1);

        column1.Equals(column1).Should().BeTrue();
    }

    [Test]
    public static void Equals_WhenDataTypeIsDifferent_ReturnsFalse()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("Test", ExtractorDataType.Integer, 1);

        column1.Equals(column2).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenColumnIndexIsDifferent_ReturnsFalse()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("Test", ExtractorDataType.String, 2);

        column1.Equals(column2).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenOneColumnIndexIsNull_ReturnsFalse()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String, 1);
        var column2 = new ExtractorColumn("Test", ExtractorDataType.String);

        column1.Equals(column2).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenBothColumnIndexAreNull_ReturnsTrue()
    {
        var column1 = new ExtractorColumn("Test", ExtractorDataType.String);
        var column2 = new ExtractorColumn("Test", ExtractorDataType.String);

        column1.Equals(column2).Should().BeTrue();
    }
}
