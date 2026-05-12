using Microsoft.AspNetCore.Mvc;

namespace PhotoAlbumApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;

        public HomeController(IWebHostEnvironment env)
        {
            _env = env;
        }

        public IActionResult Index()
        {
            string path = Path.Combine(_env.WebRootPath, "images");

            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            var files = Directory.GetFiles(path)
                        .Select(f => Path.GetFileName(f))
                        .ToList();

            ViewData["HideFooter"] = true;
            return View(files);
        }

        [HttpPost]
        public IActionResult Upload(IFormFile file)
        {
            if (file != null)
            {
                string path = Path.Combine(_env.WebRootPath, "images", file.FileName);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
            }

            return RedirectToAction("Index");
        }

        public IActionResult Delete(string name)
        {
            string path = Path.Combine(_env.WebRootPath, "images", name);

            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
            }

            return RedirectToAction("Index");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult About()
        {
            return View();
        }
    }
}