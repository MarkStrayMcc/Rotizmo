using Hero.Infrastructure.Filters;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

namespace Hero.Tests.Filters;

[TestFixture]
public class QuoteBindResponseResultFilterTests
{
       [Test]
    public async Task ShouldPopulateHttpContextItemsWithQuoteBindResponseMeta()
    {
        // Arrange
        var filter = new QuoteBindResponseResultFilter();

        var mockContext = Substitute.For<HttpContext>();
        var items = mockContext.Items;
        var actionContext = StubActionContext(mockContext);
        var policyNumberUid = Guid.NewGuid();
        
        var actionResult = new OkObjectResult(new QuoteBindResponse()
        {
            PolicyNumber = "pol2134",
            PolicyNumberUid = policyNumberUid
        });

        var resultExecutingContext = StubResultExecutingContext(actionContext, actionResult);

        // Act
        await filter.OnResultExecutionAsync(resultExecutingContext, next: () => Task.FromResult(StubbedResultExecutedContext()));

        // Assert;
        items.Received().Add(Arg.Is("x-policy-number-uid"), Arg.Is(policyNumberUid.ToString()));
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