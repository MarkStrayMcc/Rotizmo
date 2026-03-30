using System.Diagnostics.CodeAnalysis;
using Hero.Integration.Aspose;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public static class ExtractorColumnConfigurationTests
{
    [Test]
    public static void Constructor_WhenColumnsIsNull_ThrowsArgumentNullException()
    {
        Action act = () => _ = new ExtractorColumnConfiguration(null!, 0);

        act.Should().Throw<ArgumentNullException>();
    }

    [Test]
    public static void Equals_WhenObjectsAreSameReference_ShouldReturnTrue()
    {
        var columns = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config = new ExtractorColumnConfiguration(columns, 1);

        config.Equals(config).Should().BeTrue();
    }

    [Test]
    public static void Equals_WhenObjectsHaveIdenticalValues_ShouldReturnTrue()
    {
        var columns1 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns1, 1);

        var columns2 = new List<ExtractorColumn> { new("col1", ExtractorDataType.String, 0) };
        var config2 = new ExtractorColumnConfiguration(columns2, 1);

        config1.Equals(config2).Should().BeTrue();
    }

    [Test]
    public static void Equals_WhenInitialRowIndexIsDifferent_ShouldReturnFalse()
    {
        var columns = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns, 1);
        var config2 = new ExtractorColumnConfiguration(columns, 2);

        config1.Equals(config2).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenColumnsHaveDifferentContent_ShouldReturnFalse()
    {
        var columns1 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns1, 1);

        var columns2 = new List<ExtractorColumn> { new("Col2", ExtractorDataType.String, 0) };
        var config2 = new ExtractorColumnConfiguration(columns2, 1);

        config1.Equals(config2).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenColumnsHaveDifferentCount_ShouldReturnFalse()
    {
        var columns1 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns1, 1);

        var columns2 = new List<ExtractorColumn>
        {
            new("Col1", ExtractorDataType.String, 0),
            new("Col2", ExtractorDataType.String, 1),
        };

        var config2 = new ExtractorColumnConfiguration(columns2, 1);

        config1.Equals(config2).Should().BeFalse();
    }

    [Test]
    public static void Equals_WhenColumnsAreInDifferentOrder_ShouldReturnFalse()
    {
        var col1 = new ExtractorColumn("Col1", ExtractorDataType.String, 0);
        var col2 = new ExtractorColumn("Col2", ExtractorDataType.String, 1);

        var config1 = new ExtractorColumnConfiguration(new[] { col1, col2 }, 1);
        var config2 = new ExtractorColumnConfiguration(new[] { col2, col1 }, 1);

        config1.Equals(config2).Should().BeFalse();
    }

    [Test]
    [SuppressMessage("Maintainability", "CA1508:Avoid dead conditional code", Justification = "Equality implementation test")]
    public static void Equals_WhenOtherIsNull_ShouldReturnFalse()
    {
        var columns = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config = new ExtractorColumnConfiguration(columns, 1);

        config.Equals(null).Should().BeFalse();
    }

    [Test]
    public static void GetHashCode_WhenObjectsHaveIdenticalValues_ShouldReturnSameHashCode()
    {
        var columns1 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns1, 1);

        var columns2 = new List<ExtractorColumn> { new("col1", ExtractorDataType.String, 0) };
        var config2 = new ExtractorColumnConfiguration(columns2, 1);

        config1.GetHashCode().Should().Be(config2.GetHashCode());
    }

    [Test]
    public static void GetHashCode_WhenObjectsHaveDifferentValues_ShouldReturnDifferentHashCode()
    {
        var columns1 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns1, 1);

        var columns2 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config2 = new ExtractorColumnConfiguration(columns2, 2);

        config1.GetHashCode().Should().NotBe(config2.GetHashCode());
    }

    [Test]
    public static void HeaderRowIndex_ShouldReturnExpectedValue()
    {
        var columns1 = new List<ExtractorColumn> { new("Col1", ExtractorDataType.String, 0) };
        var config1 = new ExtractorColumnConfiguration(columns1, 2);

        config1.HeaderRowIndex.Should().Be(1);
    }
}
