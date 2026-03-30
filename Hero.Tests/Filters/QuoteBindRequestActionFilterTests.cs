using Hero.Infrastructure.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using WebApiDto.Dto;
using Currency = Hero.Models.Currency;
using Product = Hero.Models.Product;
using QuoteBindRequest = Hero.Models.QuoteBindRequest;

namespace Hero.Tests.Filters;

[TestFixture]
    public class QuoteBindRequestActionFilterTests
    {
        [Test]
        public async Task ShouldExitEarlyForANullActionParameter()
        {
            //Arrange
            var actionFilter = new QuoteBindRequestActionFilter();
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
        public async Task ShouldAddTelemetryPropertiesForQuoteBindRequestType()
        {
            //Arrange
            var actionFilter = new QuoteBindRequestActionFilter();
            var mockContext = Substitute.For<HttpContext>();
            var actionContext = StubActionContext(mockContext);

            var stubQuoteBindRequest = new QuoteBindRequest()
            {
                QuoteId = 1234,
                Product = new Product()
                {
                    ProductId = 1
                },
                Premium = 1000m,
                TotalPremium = 1000m,
                CommissionInformation = new CommissionInformation()
                {
                    Fee = 100m,
                    BrokerFee = 200m,
                    CfcShare = 100m,
                    ActualGrossCommission = 200m,
                    OriginalGrossCommission = 200m
                },
                Currency = new Currency()
                {
                    Id = 1,
                    IsoCode = "GBP",
                    Name = "Great British Pounds",
                    Rate = 1.0m,
                    Symbol = "£"
                }
                
                
            };

            var actionArguments = new Dictionary<string, object?>()
            {
                { "quoteParameterName", stubQuoteBindRequest }
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
            mockContext.Items.Received().Add(Arg.Is("x-quote-id"), Arg.Is("1234"));
            mockContext.Items.Received().Add(Arg.Is("x-total-premium"), Arg.Is("1000"));
            mockContext.Items.Received().Add(Arg.Is("x-currency-iso-code"), Arg.Is("GBP"));
            mockContext.Items.Received().Add(Arg.Is("x-currency-rate"), Arg.Is("1.0"));
        }
        
        [Test]
        public async Task ShouldAddTelemetryAndNotFailForNullPropertiesOnBindRequest()
        {
            //Arrange
            var actionFilter = new QuoteBindRequestActionFilter();
            var mockContext = Substitute.For<HttpContext>();
            var actionContext = StubActionContext(mockContext);

            var stubQuoteBindRequest = new QuoteBindRequest()
            {
                QuoteId = 1234,
                Product = new Product()
                {
                    ProductId = 1
                },
                Premium = 1000m,
                TotalPremium = 1000m,
                CommissionInformation = null,
                Currency = null
            };

            var actionArguments = new Dictionary<string, object?>()
            {
                { "quoteParameterName", stubQuoteBindRequest }
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
            mockContext.Items.Received().Add(Arg.Is("x-quote-id"), Arg.Is("1234"));
            mockContext.Items.Received().Add(Arg.Is("x-total-premium"), Arg.Is("1000"));
            mockContext.Items.DidNotReceive().Add(Arg.Is("x-currency-iso-code"), Arg.Is("GBP"));
            mockContext.Items.DidNotReceive().Add(Arg.Is("x-currency-rate"), Arg.Is("1.0"));
        }        

        [Test]
        public async Task ShouldExitEarlyForNonQuoteBindRequestEgIntOrGuidActionParameter()
        {
            //Arrange
            var actionFilter = new QuoteBindRequestActionFilter();
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