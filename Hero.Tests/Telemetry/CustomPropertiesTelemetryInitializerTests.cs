using Hero.Telemetry;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Http;
using NSubstitute.ReturnsExtensions;

namespace Hero.Tests.Telemetry
{


    [TestFixture]
    public class CustomPropertiesTelemetryInitializerTests
    {
        [Test]
        public void ShouldAddHttpContextItemsToTelemetryProperties()
        {
            // Arrange
            var context = Substitute.For<IHttpContextAccessor>();
            context.HttpContext!.Items = new Dictionary<object, object?>()
            {
                {"x-quote-reference","123"}
            };
            var properties = Substitute.For<IDictionary<string, string>>();

            var telemetry = new TestTelemetry(properties);

            var telemetryInitializer = new CustomPropertiesTelemetryInitializer(context);

            // Act
            telemetryInitializer.Initialize(telemetry);

            // Assert
            properties.Received().Add(Arg.Is("x-quote-reference"), Arg.Is("123"));

        }

        [Test]
        public void ShouldNotAddToPropertiesWithioutPreAmble()
        {
            // Arrange
            var context = Substitute.For<IHttpContextAccessor>();
            context.HttpContext!.Items = new Dictionary<object, object?>()
            {
                {"y-this-wont-work","wrong-pre-amble"}
            };
            var properties = Substitute.For<IDictionary<string, string>>();

            var telemetry = new TestTelemetry(properties);

            var telemetryInitializer = new CustomPropertiesTelemetryInitializer(context);

            // Act
            telemetryInitializer.Initialize(telemetry);

            // Assert
            properties.DidNotReceive().Add(Arg.Any<string>(), Arg.Any<string>());
        }

        [Test]
        public void ShouldNotProcessITelemetryThatDoesNotSupportProperties()
        {
            // Arrange
            var context = Substitute.For<IHttpContextAccessor>();
            
            var telemetry = new TelemetryWithNoPropertySupport();

            var telemetryInitializer = new CustomPropertiesTelemetryInitializer(context);

            // Act
            telemetryInitializer.Initialize(telemetry);

            // Assert

            context.DidNotReceive();

        }

        [Test]
        public void ShouldNotProcessWhenHttpContextItemsIsNull()
        {
            // Arrange
            var context = Substitute.For<IHttpContextAccessor>();
            context.HttpContext.ReturnsNull();

            var telemetry = new TestTelemetry(new Dictionary<string, string>()
            {
                {"key","value"}
            });

            var telemetryInitializer = new CustomPropertiesTelemetryInitializer(context);

            // Act
            telemetryInitializer.Initialize(telemetry);

            // Assert

            context.Received();

        }

        public class TelemetryWithNoPropertySupport : ITelemetry
        {
            public void Sanitize()
            {
                
            }

            public ITelemetry DeepClone()
            {
                return new RequestTelemetry();
            }

            public void SerializeData(ISerializationWriter serializationWriter)
            {
            }

            public DateTimeOffset Timestamp { get; set; }
            public TelemetryContext Context { get; }
            public IExtension Extension { get; set; }
            public string Sequence { get; set; }
        }

        public class TestTelemetry : ITelemetry, ISupportProperties
        {
            public TestTelemetry(IDictionary<string, string> properties)
            {
                Properties = properties;
            }
            public void Sanitize()
            {
            }

            public ITelemetry DeepClone()
            {
                return new RequestTelemetry();
            }

            public void SerializeData(ISerializationWriter serializationWriter)
            {
            }

            public DateTimeOffset Timestamp { get; set; }
            public TelemetryContext Context { get; }
            public IExtension Extension { get; set; }
            public string Sequence { get; set; }
            public IDictionary<string, string> Properties { get; set; }
        }
    }
}
