using Hero.Infrastructure.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using NSubstitute.ReceivedExtensions;
using WebApiDto.Dto;

namespace Hero.Tests.Filters
{
    [TestFixture]
    public class QuoteActionFilterTests
    {
        [Test]
        public async Task ShouldExitEarlyForANullActionParameter()
        {
            //Arrange
            var actionFilter = new QuoteActionFilter();
            var mockContext = Substitute.For<HttpContext>();
            var actionContext = StubActionContext(mockContext);

            var actionArguments = new Dictionary<string, object?>()
            {
                { "quoteParameterName", null }
            };


            var actionExecutingContext = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(),
                actionArguments, new object());

            // Act
            await actionFilter.OnActionExecutionAsync(actionExecutingContext,
                () =>
                {
                    var stubActionExecutedContext = CreateStubActionExecutedContext(StubActionContext(mockContext));
                    return Task.FromResult(stubActionExecutedContext);
                });

            // Assert
            mockContext.Items.DidNotReceive().Add(Arg.Any<string>(), Arg.Any<string>());
        }


        [Test]
        public async Task ShouldAddTelemetryPropertiesForQuoteType()
        {
            //Arrange
            var actionFilter = new QuoteActionFilter();
            var mockContext = Substitute.For<HttpContext>();
            var actionContext = StubActionContext(mockContext);

            var stubQuote = new Quote()
            {
                QuoteReference = 1234,
                QuoteUid = Guid.NewGuid()
            };

            var actionArguments = new Dictionary<string, object?>()
            {
                { "quoteParameterName", stubQuote }
            };


            var actionExecutingContext = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(),
                actionArguments, new object());

            // Act
            await actionFilter.OnActionExecutionAsync(actionExecutingContext,
                () =>
                {
                    var stubActionExecutedContext = CreateStubActionExecutedContext(StubActionContext(mockContext));
                    return Task.FromResult(stubActionExecutedContext);
                });

            // Assert
            mockContext.Items.Received().Add(Arg.Is("x-quote-reference"), Arg.Is("1234"));
        }

        [Test]
        public async Task ShouldExitEarlyForNonQuoteEgIntOtGuidActionParameter()
        {
            //Arrange
            var actionFilter = new QuoteActionFilter();
            var mockContext = Substitute.For<HttpContext>();
            var actionContext = StubActionContext(mockContext);

            var actionArguments = new Dictionary<string, object?>()
            {
                { "intParameter", 123 },
                { "guidParameterName", Guid.NewGuid() }
            };


            var actionExecutingContext = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(),
                actionArguments, new object());

            // Act
            await actionFilter.OnActionExecutionAsync(actionExecutingContext,
                () =>
                {
                    var stubActionExecutedContext = CreateStubActionExecutedContext(StubActionContext(mockContext));
                    return Task.FromResult(stubActionExecutedContext);
                });

            // Assert
            mockContext.Items.DidNotReceive().Add(Arg.Any<string>(), Arg.Any<string>());
        }

        private static ActionContext StubActionContext(HttpContext mockContext)
        {
            return new ActionContext()
            {
                HttpContext = mockContext,
                ActionDescriptor = new ActionDescriptor(),
                ModelState = { },
                RouteData = new RouteData()
            };
        }

        private static ActionExecutedContext CreateStubActionExecutedContext(ActionContext actionContext)
        {
            return new ActionExecutedContext(actionContext, new List<IFilterMetadata>(),
                new object());
        }
    }
}
