exports.api = {};

const randomText = require("./randomText");

exports.home = (req, res) => {
  res.render("home", { title: "Home" });
};

exports.about = (req, res) =>
  res.render("about", {
    title: "About",
    randomText: randomText.getRandomText(),
  });

exports.newsletter = (req, res) =>
  res.render("newsletter", {
    title: "News letter signup",
    csrf: "Token",
  });

exports.api.newsletterSignup = (req, res) => {
  console.log("CSRF token (from hidden form field): " + req.body._csrf);
  console.log("Name (from visible form field): " + req.body.name);
  console.log("Email (from visible form field): " + req.body.email);
  res.send({ result: "success" });
};

exports.vacationPhotoContest = (req, res) => {
  const now = new Date();
  res.render("contest/vacation-photo", {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};
exports.vacationPhotoContestAjax = (req, res) => {
  const now = new Date();
  res.render("contest/vacation-photo-ajax", {
    csrf: "Tokken",
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};

exports.api.vacationPhotoContest = (req, res, fields, files) => {
  console.log("field data: ", fields);
  console.log("files: ", files);
  res.send({ result: "success" });
};
exports.api.vacationPhotoContestError = (req, res, message) => {
  res.send({ result: "error", error: message });
};

// custom 404 page
exports.notFound = (req, res) => {
  res.status(404).render("404", { title: "404" });
};

// custom 500 page
exports.serverError = (err, req, res, next) => {
  console.error(err.message);
  res.status(500).render("500", { title: "500" });
};
