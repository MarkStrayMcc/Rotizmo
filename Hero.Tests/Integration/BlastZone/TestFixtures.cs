using Hero.Models;
using Hero.Models.BlastZone;
namespace Hero.Tests.Integration.BlastZone;

public static class TestFixtures
{
    public static BlastZoneCapacityRequest BlastZoneCapacityRequest(int propertyLimitId = 1)
    {
        return new BlastZoneCapacityRequest()
        {
            Location = new Location
            {
                Latitude = 51.123456,
                Longitude = -0.123456
            },
            Exposure = 1000000,
            CapacityStartDate = "2024-01-01",
            CapacityEndDate = "2024-02-01",
            ReservationExpiryDate = "2024-02-01"
        };
    }

    public static BlastZoneCapacityRequest BlastZoneCapacityRequestWithId(Guid ratingReference, int propertyLimitId = 1)
    {
        return new BlastZoneCapacityRequest()
        {
            Location = new Location
            {
                Latitude = 51.123456,
                Longitude = -0.123456
            },
            Exposure = 1000000,
            CapacityStartDate = "2024-01-01",
            CapacityEndDate = "2024-02-01",
            ReservationExpiryDate = "2024-02-01",
            Id = ratingReference
        };
    }

    public static BatchBlastZoneCapacityCheck BatchBlastZoneCapacityCheck(List<BlastZoneCapacityRequest> blastZoneCapacityRequests)
    {
        return new BatchBlastZoneCapacityCheck()
        {
            FloatingValue = 50,
            CapacityStartDate = "2024-01-01",
            CapacityEndDate = "2024-02-01",
            Properties = blastZoneCapacityRequests
        };
    }

    public static BlastZoneReservation BlastZoneCapacityResultWithCapacity()
    {
        return new BlastZoneReservation()
        {
            HasCapacity = true,
            AvailableLimit = 400000
        };
    }

    public static BlastZoneReservation BlastZoneCapacityResultWithCapacityAndReservationId(Guid blastZoneReservationId)
    {
        return new BlastZoneReservation()
        {
            Id = blastZoneReservationId,
            HasCapacity = true,
            AvailableLimit = 1000000
        };
    }

    public static BatchBlastZoneCreateResult CreateMockResponseForCreate(BatchBlastZoneCapacityCreate request)
    {
        var blastZoneReservations = request.Reservations.Select(x => new BlastZoneReservation
        {
            Id = x.Id!.Value,
            HasCapacity = true,
            AvailableLimit = 1000000,
            Latitude = x.Location.Latitude,
            Longitude = x.Location.Longitude,

        }).ToList();

        return new BatchBlastZoneCreateResult
        {
            Reservations = blastZoneReservations,
            Id = request.Id!.Value,
        };

    }

    public static List<BlastZoneReservation> CreateMockResponseForUpdate(BatchBlastZoneCapacityCreate request)
    {
        var blastZoneReservations = request.Reservations.Select(x => new BlastZoneReservation
        {
            Id = x.Id!.Value,
            HasCapacity = true,
            AvailableLimit = 1000000,
            Latitude = x.Location.Latitude,
            Longitude = x.Location.Longitude,

        }).ToList();

        return blastZoneReservations;
    }

    public static BlastZoneReservation BlastZoneCapacityResultWithNoCapacity()
    {
        return new BlastZoneReservation()
        {
            HasCapacity = false,
            AvailableLimit = 0
        };
    }

    public static PropertyLimitBlastZoneCapacityRequest PropertyLimitBlastZoneCapacityRequest(
        Guid? originalGroupId = null) => PropertyLimitBlastZoneCapacityRequest(new List<PropertyLimit>(), originalGroupId);

    public static PropertyLimitBlastZoneCapacityRequest PropertyLimitBlastZoneCapacityRequest(
        List<PropertyLimit> propertyLimits,
        Guid? originalGroupId = null,
        int binderSectionId = 0,
        string quoteCurrencyIsoCode = "GBP")
    {
        return new PropertyLimitBlastZoneCapacityRequest
        {
            PropertyLimits = propertyLimits,
            FirstLossLimitValue = 100000,
            InceptionDate = DateTime.Now,
            ExpiryDate = DateTime.Now.AddDays(1),
            ReservationExpiryDate = DateTime.Now.AddDays(1),
            ClientId = Guid.NewGuid(),
            OriginalGroupId = originalGroupId,
            BinderSectionId = binderSectionId,
            QuoteCurrencyIsoCode = quoteCurrencyIsoCode,
        };
    }

    public static List<PropertyLimit> PropertyLimits()
    {
        return new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Postcode = "TN1 1AA",
                    Address1 = "1 Test Street",
                    City = "Test City",
                    Latitude = 51.123456,
                    Longitude = -0.123456
                }
            }
        };
    }

    public static List<PropertyLimit> PropertyLimitsWithBlastZoneReservationId(Guid blastZoneReservationId)
    {
        return new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    Latitude = 51.123456,
                    Longitude = -0.123456
                },
                BlastZoneReservationId = blastZoneReservationId
            }
        };
    }
}
