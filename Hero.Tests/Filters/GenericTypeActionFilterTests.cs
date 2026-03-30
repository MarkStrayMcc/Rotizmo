using Hero.Infrastructure.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using WebApiDto.Dto;

namespace Hero.Tests.Filters;

[TestFixture]
public class GenericTypeActionFilterTests
{
    [Test]
    public async Task ShouldExitEarlyForANullActionParameter()
    {
        //Arrange
        var actionFilter = new GenericTypeActionFilter<int>();
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
    public async Task ShouldAddTelemetryPropertiesForTypeTWhereTisGuid()
    {
        //Arrange
        var actionFilter = new GenericTypeActionFilter<Guid>();
        var mockContext = Substitute.For<HttpContext>();
        var actionContext = StubActionContext(mockContext);

        var guid = Guid.NewGuid();
        var guidParameter = guid;

        var actionArguments = new Dictionary<string, object?>()
        {
            { nameof(guidParameter), guidParameter }
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
        mockContext.Items.Received().Add(Arg.Is("x-guid-parameter"), Arg.Is(guid.ToString()));

    }

    [Test]
    public async Task ShouldAddTelemetryPropertiesForTypeTWhereTisInt()
    {
        //Arrange
        var actionFilter = new GenericTypeActionFilter<int>();
        var mockContext = Substitute.For<HttpContext>();
        var actionContext = StubActionContext(mockContext);

        var intParameter = 123;

        var actionArguments = new Dictionary<string, object?>()
        {
            { "intParameter", intParameter }
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
        mockContext.Items.Received().Add(Arg.Is("x-int-parameter"), Arg.Is("123"));
    }

    [Test]
    public async Task ShouldExitEarlyGivenTisAnIntAndParamIsQuoteAndGuid()
    {
        //Arrange
        var actionFilter = new GenericTypeActionFilter<int>();
        var mockContext = Substitute.For<HttpContext>();
        var actionContext = StubActionContext(mockContext);

        var actionArguments = new Dictionary<string, object?>()
        {
            { "quoteParameter", new Quote() },
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