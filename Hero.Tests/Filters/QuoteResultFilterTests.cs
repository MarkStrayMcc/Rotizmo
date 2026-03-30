using Hero.Infrastructure.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using WebApiDto.Dto;

namespace Hero.Tests.Filters;

public class QuoteResultFilterTests
{
    [Test]
    public async Task ShouldPopulateHttpContextItemsWithQuoteMeta()
    {
        // Arrange
        var filter = new QuoteResultFilter();

        var mockContext = Substitute.For<HttpContext>();
        var items = mockContext.Items;
        var actionContext = StubActionContext(mockContext);

        var actionResult = new OkObjectResult(new Quote()
        {
            QuoteReference = 42,
            DraftQuoteId = Guid.NewGuid(),
            QuoteUid = Guid.NewGuid(),
            EnquiryId = 123,
            PolicyNumber = "pol2134"
        });

        var resultExecutingContext = StubResultExecutingContext(actionContext, actionResult);

        // Act
        await filter.OnResultExecutionAsync(resultExecutingContext, next: () => Task.FromResult(StubbedResultExecutedContext()));

        // Assert;
        items.Received().Add(Arg.Is("x-quote-reference"), Arg.Is("42"));
        items.Received().Add(Arg.Is("x-draft-quote-id"), Arg.Any<string>());
        items.Received().Add(Arg.Is("x-quote-uid"), Arg.Any<string>());
        items.Received().Add(Arg.Is("x-enquiry-id"), Arg.Is("123"));
        items.Received().Add(Arg.Is("x-policy-number"), Arg.Is("pol2134"));
    }



    private static ResultExecutingContext StubResultExecutingContext(ActionContext actionContext, OkObjectResult actionResult)
    {
        return new ResultExecutingContext(actionContext, new List<IFilterMetadata>(),
            actionResult, new object());
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

    private static ResultExecutedContext StubbedResultExecutedContext()
    {
        return new ResultExecutedContext(new ActionContext
            {
                HttpContext = new DefaultHttpContext(),
                RouteData = new RouteData(),
                ActionDescriptor = new ActionDescriptor(), ModelState = { },
            }, new List<IFilterMetadata>(),
            new OkResult(), new object());
    }
}