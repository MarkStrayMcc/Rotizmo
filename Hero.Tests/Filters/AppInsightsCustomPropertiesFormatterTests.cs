using Hero.Infrastructure.Filters;

namespace Hero.Tests.Filters;

[TestFixture]
public class AppInsightsCustomPropertiesFormatterTests
{
    private readonly AppInsightsCustomPropertiesFormatter _formatter = new();

    [Test]
    public Task ShouldHandleInt()
    {
        var person = new Person() { Age = 42 };

        var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(person.Age), person.Age);

        Assert.That(key, Is.EqualTo("x-age"));
        Assert.That(value, Is.EqualTo(person.Age.ToString()));

        return Task.CompletedTask;
    }

    [Test]
    public Task ShouldHandleGuid()
    {
        var someRandomUid = Guid.NewGuid();

        var (key, value) = _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(someRandomUid), someRandomUid);

        Assert.That(key, Is.EqualTo("x-some-random-uid"));
        Assert.That(value, Is.EqualTo(someRandomUid.ToString()));

        return Task.CompletedTask;
    }

    [Test]
    public Task ShouldThrowArgumentExceptionForNullValue()
    {
        object nullObject = null;
        Assert.ThrowsAsync<ArgumentNullException>(() =>
        {
            _formatter.ExtractKebabCaseKeyAndValueFrom(nameof(nullObject), nullObject);
            return Task.CompletedTask;
        });

        return Task.CompletedTask;
    }

    [Test]
    public Task ShouldThrowArgumentExceptionForNullKey()
    {
        
        Assert.ThrowsAsync<ArgumentNullException>(() =>
        {
            _formatter.ExtractKebabCaseKeyAndValueFrom(null, "woah");
            return Task.CompletedTask;
        });

        return Task.CompletedTask;
    }

    class Person
    {
        public int Age { get; set; }
    }
}

