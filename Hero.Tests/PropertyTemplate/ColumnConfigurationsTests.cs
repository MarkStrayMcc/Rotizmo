using System.Collections.Immutable;
using System.Text;
using Hero.Integration.Aspose;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;

namespace Hero.Tests.PropertyTemplate;

[TestFixture]
public static class ColumnConfigurationsTests
{
    [Test]
    public static void Flatten_WithAdditionalColumns_ReturnsExpectedDictionary()
    {
        var commonColumns = new List<ExtractorColumn> { new("Common1", ExtractorDataType.String) };
        var config1 = new ExtractorColumnConfiguration(
            new List<ExtractorColumn> { new("Specific1", ExtractorDataType.Integer) },
            2);

        var wordingConfig1 = new ColumnConfiguration
        {
            WordingVersions = new[] { 1, 2 }.ToImmutableList(),
            ExtractorColumnConfiguration = config1,
        };

        var columnConfigurations = new ColumnConfigurations
        {
            CommonColumns = commonColumns.ToImmutableList(),
            WordingVersionColumnConfigurations = new[] { wordingConfig1 }.ToImmutableList(),
        };

        IReadOnlyDictionary<int, ExtractorColumnConfiguration> result = columnConfigurations.Flatten();

        result.Should().HaveCount(2);
        result.Should().ContainKey(1);
        result.Should().ContainKey(2);

        ExtractorColumnConfiguration flattenedConfig = result[1];
        flattenedConfig.InitialRowIndex.Should().Be(2);
        flattenedConfig.Columns.Should().HaveCount(2);
        flattenedConfig.Columns[0].ColumnName.Should().Be("Common1");
        flattenedConfig.Columns[1].ColumnName.Should().Be("Specific1");

        result[2].Should().Be(flattenedConfig);
    }

    [Test]
    public static void Flatten_WithNoAdditionalColumns_ReturnsExpectedDictionary()
    {
        var commonColumns = new List<ExtractorColumn> { new("Common1", ExtractorDataType.String) };
        var config1 = new ExtractorColumnConfiguration(
            Array.Empty<ExtractorColumn>(),
            2);

        var wordingConfig1 = new ColumnConfiguration
        {
            WordingVersions = new[] { 1, 2 }.ToImmutableList(),
            ExtractorColumnConfiguration = config1,
        };

        var columnConfigurations = new ColumnConfigurations
        {
            CommonColumns = commonColumns.ToImmutableList(),
            WordingVersionColumnConfigurations = new[] { wordingConfig1 }.ToImmutableList(),
        };

        IReadOnlyDictionary<int, ExtractorColumnConfiguration> result = columnConfigurations.Flatten();

        result.Should().HaveCount(2);
        result.Should().ContainKey(1);
        result.Should().ContainKey(2);

        ExtractorColumnConfiguration flattenedConfig = result[1];
        flattenedConfig.InitialRowIndex.Should().Be(2);
        flattenedConfig.Columns.Should().HaveCount(1);
        flattenedConfig.Columns[0].ColumnName.Should().Be("Common1");

        result[2].Should().Be(flattenedConfig);
    }

    [Test]
    public static void LoadFromConfig_ReturnsExpectedObject()
    {
        const string json = @"
{
  ""CommonColumns"": [
    {
      ""ColumnName"": ""Country"",
      ""DataType"": ""String""
    }
  ],
  ""WordingVersionColumnConfigurations"": [
    {
      ""WordingVersions"": [ 123 ],
      ""ExtractorColumnConfiguration"": {
        ""InitialRowIndex"": 1,
        ""Columns"": [
          {
            ""ColumnName"": ""Limit"",
            ""DataType"": ""Integer""
          }
        ]
      }
    }
  ]
}";

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var fileInfo = Substitute.For<IFileInfo>();
        fileInfo.CreateReadStream().Returns(stream);
        fileInfo.Exists.Returns(true);

        var fileProvider = Substitute.For<IFileProvider>();
        fileProvider.GetFileInfo(Arg.Any<string>()).Returns(fileInfo);

        var inMemorySettings = new Dictionary<string, string> { { "TemplateValidation:Filename", "test.json" } };
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var env = Substitute.For<IWebHostEnvironment>();
        env.ContentRootFileProvider.Returns(fileProvider);

        IReadOnlyDictionary<int, ExtractorColumnConfiguration> result = ColumnConfigurations.LoadFromConfig(configuration, env);

        result.Should().HaveCount(1);
        result.Should().ContainKey(123);

        ExtractorColumnConfiguration flattenedConfig = result[123];
        flattenedConfig.InitialRowIndex.Should().Be(1);
        flattenedConfig.Columns.Should().HaveCount(2);
        flattenedConfig.Columns[0].ColumnName.Should().Be("Country");
        flattenedConfig.Columns[1].ColumnName.Should().Be("Limit");
    }
}
