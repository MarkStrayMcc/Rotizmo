using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Error()
        {
            return View();
        }
    }
}
