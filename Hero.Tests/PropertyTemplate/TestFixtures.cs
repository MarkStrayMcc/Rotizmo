using Hero.Integration.Aspose;
using Hero.Integration.Aspose.MultipleProperties.Terrorism;
using WebApiDto.Dto;
using ClientLocation = Hero.Models.ClientLocation;
using ClientLocationProperties = Hero.Models.ClientLocationProperties;
using Country = Hero.Models.Country;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Tests.PropertyTemplate;

public static class TestFixtures
{
    private const string BuildingUseTag = "BuildingUse";

    public static List<PropertyLimit> GetPropertyLimits()
    {
        return new List<PropertyLimit>()
        {
            new()
            {
                PropertyDamageLimit = 20000,
                ContentsDamageLimit = 60000,
                ActualLossSustainedLimit = 1000,
                LossOfRentLimit = 5000,
                IncreasedCostOfWorkingLimit = 3000,
                AlternativeAccommodationLimit = 6000,
                StockDamageLimit = 0,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 4,
                    Address1 = "1600 Pennsylvania Avenue",
                    Address2 = "Northwest",
                    City = "Washington",
                    Postcode = "37188",
                    StateProvinceCode = "DC",
                    Latitude = 38.897778,
                    Longitude = -77.036389,
                    Country = new Country(){ CountryId = 4, Name ="US" ,IsoCode ="US" },
                    County = "",
                    ClientLocationProperties = new List<ClientLocationProperties> {
                        new ClientLocationProperties() { Tag = BuildingUseTag, Value = "COMMERCIAL" }
                    }
                }
            },
            new()
            {
                PropertyDamageLimit = 30000,
                ContentsDamageLimit = 40000,
                ActualLossSustainedLimit = 1100,
                LossOfRentLimit = 5100,
                IncreasedCostOfWorkingLimit = 3100,
                AlternativeAccommodationLimit = 6100,
                StockDamageLimit = 0,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Address1 = "85 Gracechurch St",
                    Address2 = "Central",
                    City = "London",
                    Postcode = "EC3V 0AA",
                    County = "London",
                    Country = new Country(){ CountryId = 1,Name ="UK",IsoCode ="US" },
                    ClientLocationProperties = new List<ClientLocationProperties> {
                        new ClientLocationProperties() { Tag = BuildingUseTag, Value = "RESIDENTIAL" }
                    }
                }
            },
            new()
            {
                PropertyDamageLimit = 30000,
                ContentsDamageLimit = 40000,
                ActualLossSustainedLimit = 1100,
                LossOfRentLimit = 5100,
                IncreasedCostOfWorkingLimit = 3100,
                AlternativeAccommodationLimit = 6100,
                StockDamageLimit = 0,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Address1 = "87 Gracechurch St",
                    Address2 = "Central",
                    City = "London",
                    Postcode = "EC3V 0AA",
                    County = "London",
                    Country = new Country(){ CountryId = 1,Name ="UK",IsoCode ="US" },
                    ClientLocationProperties = new List<ClientLocationProperties> {
                        new ClientLocationProperties() { Tag = BuildingUseTag, Value = "RESIDENTIAL" }
                    }
                }
            }
        };
    }

    public static IEnumerable<WebApiDto.Dto.PropertyLimit> GetPropertyLimitsFromQuote()
    {
        return new List<WebApiDto.Dto.PropertyLimit>()
        {
            new()
            {
                PropertyDamageLimit = 20000,
                ContentsDamageLimit = 60000,
                ActualLossSustainedLimit = 1000,
                LossOfRentLimit = 5000,
                IncreasedCostOfWorkingLimit = 3000,
                AlternativeAccommodationLimit = 6000,
                StockDamageLimit = 0,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 4,
                    Address1 = "1600 Pennsylvania Avenue",
                    Address2 = "Northwest",
                    City = "Washington",
                    Postcode = "37188",
                    StateProvinceCode = "DC",
                    Latitude = 38.897778,
                    Longitude = -77.036389,
                    Country = new Country(){ CountryId = 4, Name ="US" ,IsoCode ="US" },
                    County = "",
                    ClientLocationProperties = new List<ClientLocationProperties> {
                        new ClientLocationProperties() { Tag = BuildingUseTag, Value = "COMMERCIAL" }
                    }
                }
            },
            new()
            {
                PropertyDamageLimit = 30000,
                ContentsDamageLimit = 40000,
                ActualLossSustainedLimit = 1100,
                LossOfRentLimit = 5100,
                IncreasedCostOfWorkingLimit = 3100,
                AlternativeAccommodationLimit = 6100,
                StockDamageLimit = 0,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Address1 = "85 Gracechurch St",
                    Address2 = "Central",
                    City = "London",
                    Postcode = "EC3V 0AA",
                    County = "London",
                    Country = new Country(){ CountryId = 1,Name ="UK",IsoCode ="US" },
                    ClientLocationProperties = new List<ClientLocationProperties> {
                        new ClientLocationProperties() { Tag = BuildingUseTag, Value = "RESIDENTIAL" }
                    }
                }
            },
            new()
            {
                PropertyDamageLimit = 30000,
                ContentsDamageLimit = 40000,
                ActualLossSustainedLimit = 1100,
                LossOfRentLimit = 5100,
                IncreasedCostOfWorkingLimit = 3100,
                AlternativeAccommodationLimit = 6100,
                StockDamageLimit = 0,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Address1 = "87 Gracechurch St",
                    Address2 = "Central",
                    City = "London",
                    Postcode = "EC3V 0AA",
                    County = "London",
                    Country = new Country(){ CountryId = 1,Name ="UK",IsoCode ="US" },
                    ClientLocationProperties = new List<ClientLocationProperties> {
                        new ClientLocationProperties() { Tag = BuildingUseTag, Value = "RESIDENTIAL" }
                    }
                }
            }
        };
    }

    public static List<ExtractedRow> AddAdditionalRows(this List<ExtractedRow> rows,
        params ExtractedRow[] additionalRows)
    {
        rows.AddRange(additionalRows);
        return rows;
    }

    public static ExtractedRow CreateExtractedRow(string postCode, string country = "US", string addressLine1 = "1600 Pennsylvania Avenue", string addressLine2 = "Northwest", string buildingUse = "RESIDENTIAL")
    {
        var row = new ExtractedRow()
        {
            CellValues = new List<ExtractedCellValue>
            {
                new()
                {
                    ColumnName = TemplateConfiguration.Country,
                    ColumnIndex = 0,
                    StringValue = country,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.AddressLine1,
                    ColumnIndex = 1,
                    StringValue = addressLine1,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.AddressLine2,
                    ColumnIndex = 2,
                    StringValue = addressLine2,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.TownOrCity,
                    ColumnIndex = 3,
                    StringValue = "Washington",
                },
                new()
                {
                    ColumnName = TemplateConfiguration.StateOrProvince,
                    ColumnIndex = 4,
                    StringValue = "District of Columbia",
                },
                new()
                {
                    ColumnName = TemplateConfiguration.County,
                    ColumnIndex = 5,
                    StringValue = "",
                },
                new()
                {
                    ColumnName = TemplateConfiguration.PostCode,
                    ColumnIndex = 6,
                    StringValue = postCode,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.Latitude,
                    ColumnIndex = 7,
                    DoubleValue = 38.897778,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.Longitude,
                    ColumnIndex = 8,
                    DoubleValue = -77.036389,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.BuildingUse,
                    ColumnIndex = 9,
                    StringValue = buildingUse,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.PropertyDamageLimit,
                    ColumnIndex = 10,
                    IntegerValue = 20000,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.ContentsDamageLimit,
                    ColumnIndex = 11,
                    IntegerValue = 60000,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                    ColumnIndex = 12,
                    IntegerValue = 1000,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                    ColumnIndex = 13,
                    IntegerValue = 3000,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.LossOfRentLimit,
                    ColumnIndex = 14,
                    IntegerValue = 5000,
                },
                new()
                {
                    ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                    ColumnIndex = 15,
                    IntegerValue = 6000,
                }
            }
        };

        return row;
    }

    public static List<ExtractedRow> StubListOfExtractedRowsForTemplate()
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                RowNumber = 1 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "US",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "1600 Pennsylvania Avenue",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Northwest",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Washington",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "District of Columbia",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "37188",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = 38.897778,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = -77.036389,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "COMMERCIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 20000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 60000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6000,
                    }
                }
            },
            new()
            {
                RowNumber = 2 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "85 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "EC3V 0AA",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            },
            new()
            {
                RowNumber = 3 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "87 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "EC3V 0AA",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            }
        };
    }
    public static List<ExtractedRow> StubListOfExtractedRows()
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                RowNumber = 1 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "US",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "1600 Pennsylvania Avenue",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Northwest",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Washington",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "District of Columbia",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "37188",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = 38.897778,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = -77.036389,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "COMMERCIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 20000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 60000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6000,
                    }
                }
            },
            new()
            {
                RowNumber = 2 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "85 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "EC3V 0AA",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = 51.1,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = -3.4,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            },
            new()
            {
                RowNumber = 3 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "87 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "EC3V 0AA",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            }
        };
    }

    public static List<ExtractedRow> StubListOfExtractedRowsForFloatingValues(PropertyLimitFloatingValues? floatingValues = null)
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                RowNumber = 1 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 0,
                        IntegerValue = floatingValues?.ContentsDamageLimit ?? 60000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 1,
                        IntegerValue = floatingValues?.ActualLossSustainedLimit ?? 1000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 2,
                        IntegerValue = floatingValues?.IncreasedCostOfWorkingLimit ??3000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 3,
                        IntegerValue = floatingValues?.LossOfRentLimit ??5000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 4,
                        IntegerValue = floatingValues?.AlternativeAccommodationLimit ??6000,
                    }
                }
            }
        };
    }

    public static List<ExtractedRow> StubListOfExtractedRowsWithsomeInvalidClientLocations()
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "US",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "1600 Pennsylvania Avenue",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Northwest",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Washington",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "District of Columbia",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "37188",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = 38.897778,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = -77.036389,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "COMMERCIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 20000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 60000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6000,
                    }
                }
            },
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            },
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "87 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            }
        };
    }

    public static List<ExtractedRow> GetExtractedRowsWithNullGeolocationData()
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "US",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "1600 Pennsylvania Avenue",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Northwest",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Washington",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "District of Columbia",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "37188",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "COMMERCIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 20000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 60000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6000,
                    }
                }
            },
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "85 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "EC3V 0AA",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            },
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "87 Gracechurch St",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Central",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "London",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "EC3V 0AA",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 14,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            }
        };
    }

    public static List<ExtractedRow> StubListOfExtractedRowsForTemplate_WithOneLocationWithNoTIV()
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                RowNumber = 1 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "US",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "1600 Pennsylvania Avenue",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Northwest",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Washington",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "District of Columbia",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "37188",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = 38.897778,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = -77.036389,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "COMMERCIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 0,
                    }
                }
            },
            new()
            {
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "UK",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "957 Holderness Rd",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Hull",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "Hull",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "HU8 9DR",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = null,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "RESIDENTIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = 30000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 40000,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 1100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 14,
                        IntegerValue = 3100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 5100,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 6100,
                    }
                }
            }
        };
    }

    public static List<ExtractedRow> StubListOfExtractedRowsForTemplate_TotalInsuredValue(int propertyDamageLimit)
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                RowNumber = 1 ,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.Country,
                        ColumnIndex = 0,
                        StringValue = "US",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine1,
                        ColumnIndex = 1,
                        StringValue = "1600 Pennsylvania Avenue",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AddressLine2,
                        ColumnIndex = 2,
                        StringValue = "Northwest",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.TownOrCity,
                        ColumnIndex = 3,
                        StringValue = "Washington",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.StateOrProvince,
                        ColumnIndex = 4,
                        StringValue = "District of Columbia",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.County,
                        ColumnIndex = 5,
                        StringValue = "",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PostCode,
                        ColumnIndex = 6,
                        StringValue = "37188",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Latitude,
                        ColumnIndex = 7,
                        DoubleValue = 38.897778,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.Longitude,
                        ColumnIndex = 8,
                        DoubleValue = -77.036389,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.BuildingUse,
                        ColumnIndex = 9,
                        StringValue = "COMMERCIAL",
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.PropertyDamageLimit,
                        ColumnIndex = 10,
                        IntegerValue = propertyDamageLimit,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ContentsDamageLimit,
                        ColumnIndex = 11,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.ActualLossSustainedLimit,
                        ColumnIndex = 12,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.IncreasedCostOfWorkingLimit,
                        ColumnIndex = 13,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.LossOfRentLimit,
                        ColumnIndex = 14,
                        IntegerValue = 0,
                    },
                    new()
                    {
                        ColumnName = TemplateConfiguration.AlternativeAccommodationLimit,
                        ColumnIndex = 15,
                        IntegerValue = 0,
                    }
                }
            },
        };
    }

    public static List<ExtractedRow> StubListOfExtractedRowsForFirstLossLimit(int firstLossLimit)
    {
        return new List<ExtractedRow>()
        {
            new()
            {
                RowNumber = 1,
                CellValues = new List<ExtractedCellValue>
                {
                    new()
                    {
                        ColumnName = TemplateConfiguration.FirstLossLimit,
                        ColumnIndex = 0,
                        IntegerValue = firstLossLimit,
                    }
                }
            }
        };
    }

    public static IEnumerable<object[]>
        GetFloatingValuesTestCases()
    {
        yield return new object[] { 50000000, new PropertyLimitFloatingValues { ActualLossSustainedLimit = 10000000, AlternativeAccommodationLimit = 0, ContentsDamageLimit = 10000000, IncreasedCostOfWorkingLimit = 0, LossOfRentLimit = 10000000 }, 0, "PASSED" };
        yield return new object[] { 250000000, new PropertyLimitFloatingValues { ActualLossSustainedLimit = 50000000, AlternativeAccommodationLimit = 0, ContentsDamageLimit = 0, IncreasedCostOfWorkingLimit = 0, LossOfRentLimit = 0 }, 0, "PASSED" };
        yield return new object[] { 250000000, new PropertyLimitFloatingValues { ActualLossSustainedLimit = 50000000, AlternativeAccommodationLimit = 0, ContentsDamageLimit = 50000000, IncreasedCostOfWorkingLimit = 0, LossOfRentLimit = 10000000 }, 1, "Location maximum limit of £300,000,000 has been exceeded" };
        yield return new object[] { 300000000, new PropertyLimitFloatingValues { ActualLossSustainedLimit = 10000000, AlternativeAccommodationLimit = 0, ContentsDamageLimit = 10000000, IncreasedCostOfWorkingLimit = 0, LossOfRentLimit = 10000000 }, 1, "Location maximum limit of £300,000,000 has been exceeded" };
    }
}
