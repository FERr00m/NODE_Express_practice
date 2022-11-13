const randomText = require("./randomText");

exports.home = (req, res) => {
  res.render("home", { title: "Home" });
};

exports.about = (req, res) =>
  res.render("about", {
    title: "About",
    randomText: randomText.getRandomText(),
  });

// custom 404 page
exports.notFound = (req, res) => {
  res.render("404", { title: "404" });
};

// custom 500 page
exports.serverError = (err, req, res, next) => {
  console.error(err.message);
  res.render("500", { title: "500" });
};
