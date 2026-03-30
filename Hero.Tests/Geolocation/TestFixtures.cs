namespace Hero.Tests.Geolocation;

internal static class TestFixtures
{
    public static string GetGeolocationResultJsonWhenSuccessful()
    {
        return @"{
           ""results"" : 
           [
              {
                 ""address_components"" : 
                 [
                    {
                       ""long_name"" : ""85"",
                       ""short_name"" : ""85"",
                       ""types"" : 
                       [
                          ""street_number""
                       ]
                    },
                    {
                       ""long_name"" : ""Gracechurch Street"",
                       ""short_name"" : ""Gracechurch St"",
                       ""types"" : 
                       [
                          ""route""
                       ]
                    },
                    {
                       ""long_name"" : ""London"",
                       ""short_name"" : ""London"",
                       ""types"" : 
                       [
                          ""postal_town""
                       ]
                    },
                    {
                       ""long_name"" : ""Greater London"",
                       ""short_name"" : ""Greater London"",
                       ""types"" : 
                       [
                          ""administrative_area_level_2"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""England"",
                       ""short_name"" : ""England"",
                       ""types"" : 
                       [
                          ""administrative_area_level_1"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""United Kingdom"",
                       ""short_name"" : ""GB"",
                       ""types"" : 
                       [
                          ""country"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""EC3V 0DN"",
                       ""short_name"" : ""EC3V 0DN"",
                       ""types"" : 
                       [
                          ""postal_code""
                       ]
                    }
                 ],
                 ""formatted_address"" : ""85 Gracechurch St, London EC3V 0DN, UK"",
                 ""geometry"" : 
                 {
                    ""location"" : 
                    {
                       ""lat"" : 51.51272900000001,
                       ""lng"" : -0.0842816
                    },
                    ""location_type"" : ""ROOFTOP"",
                    ""viewport"" : 
                    {
                       ""northeast"" : 
                       {
                          ""lat"" : 51.51410738029151,
                          ""lng"" : -0.08303966970849797
                       },
                       ""southwest"" : 
                       {
                          ""lat"" : 51.51140941970851,
                          ""lng"" : -0.08573763029150203
                       }
                    }
                 },
                 ""place_id"" : ""ChIJ3_bG8FIDdkgR6wNmeQxQ4Mg"",
                 ""plus_code"" : 
                 {
                    ""compound_code"" : ""GW78+37 London, UK"",
                    ""global_code"" : ""9C3XGW78+37""
                 },
                 ""types"" : 
                 [
                    ""street_address""
                 ]
              }
           ],
           ""status"" : ""OK""
        }";
    }

    public static string GetGeolocationResultJsonWhenSuccessfulButNotRooftop()
    {
        return @"{
           ""results"" : 
           [
              {
                 ""address_components"" : 
                 [
                    {
                       ""long_name"" : ""85"",
                       ""short_name"" : ""85"",
                       ""types"" : 
                       [
                          ""street_number""
                       ]
                    },
                    {
                       ""long_name"" : ""Gracechurch Street"",
                       ""short_name"" : ""Gracechurch St"",
                       ""types"" : 
                       [
                          ""route""
                       ]
                    },
                    {
                       ""long_name"" : ""London"",
                       ""short_name"" : ""London"",
                       ""types"" : 
                       [
                          ""postal_town""
                       ]
                    },
                    {
                       ""long_name"" : ""Greater London"",
                       ""short_name"" : ""Greater London"",
                       ""types"" : 
                       [
                          ""administrative_area_level_2"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""England"",
                       ""short_name"" : ""England"",
                       ""types"" : 
                       [
                          ""administrative_area_level_1"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""United Kingdom"",
                       ""short_name"" : ""GB"",
                       ""types"" : 
                       [
                          ""country"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""EC3V 0DN"",
                       ""short_name"" : ""EC3V 0DN"",
                       ""types"" : 
                       [
                          ""postal_code""
                       ]
                    }
                 ],
                 ""formatted_address"" : ""85 Gracechurch St, London EC3V 0DN, UK"",
                 ""geometry"" : 
                 {
                    ""location"" : 
                    {
                       ""lat"" : 51.51272900000001,
                       ""lng"" : -0.0842816
                    },
                    ""location_type"" : ""RANGE INTERPOLATED"",
                    ""viewport"" : 
                    {
                       ""northeast"" : 
                       {
                          ""lat"" : 51.51410738029151,
                          ""lng"" : -0.08303966970849797
                       },
                       ""southwest"" : 
                       {
                          ""lat"" : 51.51140941970851,
                          ""lng"" : -0.08573763029150203
                       }
                    }
                 },
                 ""place_id"" : ""ChIJ3_bG8FIDdkgR6wNmeQxQ4Mg"",
                 ""plus_code"" : 
                 {
                    ""compound_code"" : ""GW78+37 London, UK"",
                    ""global_code"" : ""9C3XGW78+37""
                 },
                 ""types"" : 
                 [
                    ""street_address""
                 ]
              }
           ],
           ""status"" : ""OK""
        }";
    }

    public static string GetGeolocationResultJsonWhenMultipleResultsTooFarApart()
    {
        return @"{
           ""results"" : 
           [
              {
                 ""address_components"" : 
                 [
                    {
                       ""long_name"" : ""85"",
                       ""short_name"" : ""85"",
                       ""types"" : 
                       [
                          ""street_number""
                       ]
                    },
                    {
                       ""long_name"" : ""Gracechurch Street"",
                       ""short_name"" : ""Gracechurch St"",
                       ""types"" : 
                       [
                          ""route""
                       ]
                    },
                    {
                       ""long_name"" : ""London"",
                       ""short_name"" : ""London"",
                       ""types"" : 
                       [
                          ""postal_town""
                       ]
                    },
                    {
                       ""long_name"" : ""Greater London"",
                       ""short_name"" : ""Greater London"",
                       ""types"" : 
                       [
                          ""administrative_area_level_2"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""England"",
                       ""short_name"" : ""England"",
                       ""types"" : 
                       [
                          ""administrative_area_level_1"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""United Kingdom"",
                       ""short_name"" : ""GB"",
                       ""types"" : 
                       [
                          ""country"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""EC3V 0DN"",
                       ""short_name"" : ""EC3V 0DN"",
                       ""types"" : 
                       [
                          ""postal_code""
                       ]
                    }
                 ],
                 ""formatted_address"" : ""85 Gracechurch St, London EC3V 0DN, UK"",
                 ""geometry"" : 
                 {
                    ""location"" : 
                    {
                       ""lat"" : 51.51272900000001,
                       ""lng"" : -0.0842816
                    },
                    ""location_type"" : ""ROOFTOP"",
                    ""viewport"" : 
                    {
                       ""northeast"" : 
                       {
                          ""lat"" : 51.51410738029151,
                          ""lng"" : -0.08303966970849797
                       },
                       ""southwest"" : 
                       {
                          ""lat"" : 51.51140941970851,
                          ""lng"" : -0.08573763029150203
                       }
                    }
                 },
                 ""place_id"" : ""ChIJ3_bG8FIDdkgR6wNmeQxQ4Mg"",
                 ""plus_code"" : 
                 {
                    ""compound_code"" : ""GW78+37 London, UK"",
                    ""global_code"" : ""9C3XGW78+37""
                 },
                 ""types"" : 
                 [
                    ""street_address""
                 ]
              },
{
                 ""address_components"" : 
                 [
                    {
                       ""long_name"" : ""87"",
                       ""short_name"" : ""87"",
                       ""types"" : 
                       [
                          ""street_number""
                       ]
                    },
                    {
                       ""long_name"" : ""Gracechurch Street"",
                       ""short_name"" : ""Gracechurch St"",
                       ""types"" : 
                       [
                          ""route""
                       ]
                    },
                    {
                       ""long_name"" : ""London"",
                       ""short_name"" : ""London"",
                       ""types"" : 
                       [
                          ""postal_town""
                       ]
                    },
                    {
                       ""long_name"" : ""Greater London"",
                       ""short_name"" : ""Greater London"",
                       ""types"" : 
                       [
                          ""administrative_area_level_2"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""England"",
                       ""short_name"" : ""England"",
                       ""types"" : 
                       [
                          ""administrative_area_level_1"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""United Kingdom"",
                       ""short_name"" : ""GB"",
                       ""types"" : 
                       [
                          ""country"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""EC3V 0DN"",
                       ""short_name"" : ""EC3V 0DN"",
                       ""types"" : 
                       [
                          ""postal_code""
                       ]
                    }
                 ],
                 ""formatted_address"" : ""24 Barrett Rd, London E17 9ET, UK"",
                 ""geometry"" : 
                 {
                    ""location"" : 
                    {
                       ""lat"" : 51.58444657194276,
                       ""lng"" : -0.0047840670685107434
                    },
                    ""location_type"" : ""ROOFTOP"",
                    ""viewport"" : 
                    {
                       ""northeast"" : 
                       {
                          ""lat"" : 51.51410738029151,
                          ""lng"" : -0.08303966970849797
                       },
                       ""southwest"" : 
                       {
                          ""lat"" : 51.51140941970851,
                          ""lng"" : -0.08573763029150203
                       }
                    }
                 },
                 ""place_id"" : ""ChIJ3_bG8FIDdkgR6wNmeQxQ4Mg"",
                 ""plus_code"" : 
                 {
                    ""compound_code"" : ""GW78+37 London, UK"",
                    ""global_code"" : ""9C3XGW78+37""
                 },
                 ""types"" : 
                 [
                    ""street_address""
                 ]
              }
           ],
           ""status"" : ""OK""
        }";
    }

    public static string GetGeolocationResultJsonWhenMultipleResultsWithinRadius250Meters()
    {
        return @"{
           ""results"" : 
           [
              {
                 ""address_components"" : 
                 [
                    {
                       ""long_name"" : ""85"",
                       ""short_name"" : ""85"",
                       ""types"" : 
                       [
                          ""street_number""
                       ]
                    },
                    {
                       ""long_name"" : ""Gracechurch Street"",
                       ""short_name"" : ""Gracechurch St"",
                       ""types"" : 
                       [
                          ""route""
                       ]
                    },
                    {
                       ""long_name"" : ""London"",
                       ""short_name"" : ""London"",
                       ""types"" : 
                       [
                          ""postal_town""
                       ]
                    },
                    {
                       ""long_name"" : ""Greater London"",
                       ""short_name"" : ""Greater London"",
                       ""types"" : 
                       [
                          ""administrative_area_level_2"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""England"",
                       ""short_name"" : ""England"",
                       ""types"" : 
                       [
                          ""administrative_area_level_1"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""United Kingdom"",
                       ""short_name"" : ""GB"",
                       ""types"" : 
                       [
                          ""country"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""EC3V 0DN"",
                       ""short_name"" : ""EC3V 0DN"",
                       ""types"" : 
                       [
                          ""postal_code""
                       ]
                    }
                 ],
                 ""formatted_address"" : ""85 Gracechurch St, London EC3V 0DN, UK"",
                 ""geometry"" : 
                 {
                    ""location"" : 
                    {
                       ""lat"" : 51.51272900000001,
                       ""lng"" : -0.0842816
                    },
                    ""location_type"" : ""ROOFTOP"",
                    ""viewport"" : 
                    {
                       ""northeast"" : 
                       {
                          ""lat"" : 51.51410738029151,
                          ""lng"" : -0.08303966970849797
                       },
                       ""southwest"" : 
                       {
                          ""lat"" : 51.51140941970851,
                          ""lng"" : -0.08573763029150203
                       }
                    }
                 },
                 ""place_id"" : ""ChIJ3_bG8FIDdkgR6wNmeQxQ4Mg"",
                 ""plus_code"" : 
                 {
                    ""compound_code"" : ""GW78+37 London, UK"",
                    ""global_code"" : ""9C3XGW78+37""
                 },
                 ""types"" : 
                 [
                    ""street_address""
                 ]
              },
{
                 ""address_components"" : 
                 [
                    {
                       ""long_name"" : ""87"",
                       ""short_name"" : ""87"",
                       ""types"" : 
                       [
                          ""street_number""
                       ]
                    },
                    {
                       ""long_name"" : ""Gracechurch Street"",
                       ""short_name"" : ""Gracechurch St"",
                       ""types"" : 
                       [
                          ""route""
                       ]
                    },
                    {
                       ""long_name"" : ""London"",
                       ""short_name"" : ""London"",
                       ""types"" : 
                       [
                          ""postal_town""
                       ]
                    },
                    {
                       ""long_name"" : ""Greater London"",
                       ""short_name"" : ""Greater London"",
                       ""types"" : 
                       [
                          ""administrative_area_level_2"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""England"",
                       ""short_name"" : ""England"",
                       ""types"" : 
                       [
                          ""administrative_area_level_1"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""United Kingdom"",
                       ""short_name"" : ""GB"",
                       ""types"" : 
                       [
                          ""country"",
                          ""political""
                       ]
                    },
                    {
                       ""long_name"" : ""EC3V 0DN"",
                       ""short_name"" : ""EC3V 0DN"",
                       ""types"" : 
                       [
                          ""postal_code""
                       ]
                    }
                 ],
                 ""formatted_address"" : ""85 Gracechurch St, London EC3V 0DN, UK"",
                 ""geometry"" : 
                 {
                    ""location"" : 
                    {
                       ""lat"" : 51.51272900000001,
                       ""lng"" : -0.0842816
                    },
                    ""location_type"" : ""ROOFTOP"",
                    ""viewport"" : 
                    {
                       ""northeast"" : 
                       {
                          ""lat"" : 51.51410738029151,
                          ""lng"" : -0.08303966970849797
                       },
                       ""southwest"" : 
                       {
                          ""lat"" : 51.51140941970851,
                          ""lng"" : -0.08573763029150203
                       }
                    }
                 },
                 ""place_id"" : ""ChIJ3_bG8FIDdkgR6wNmeQxQ4Mg"",
                 ""plus_code"" : 
                 {
                    ""compound_code"" : ""GW78+37 London, UK"",
                    ""global_code"" : ""9C3XGW78+37""
                 },
                 ""types"" : 
                 [
                    ""street_address""
                 ]
              }
           ],
           ""status"" : ""OK""
        }";
    }

    public static string GetGeolocationResultJsonWhenAddressNotFound()
    {
        return @"{
           ""results"" : [],
           ""status"" : ""ZERO_RESULTS""
        }";
    }

    public static string GetGeolocationResultJsonWhenRequestDenied()
    {
        return @"{
           ""error_message"" : ""The provided API key is invalid."",
           ""results"" : [],
           ""status"" : ""REQUEST_DENIED""
        }";
    }
}