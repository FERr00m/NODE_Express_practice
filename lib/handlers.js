exports.api = {};

const randomText = require("./randomText");
const nodemailer = require("nodemailer");
const { credentials } = require("../config");

const mailTransport = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: false, // use TLS
  auth: {
    user: credentials.mailConfig.user,
    pass: credentials.mailConfig.password,
  },
});

exports.home = (req, res) => {
  res.cookie("aloha", "hello", { signed: true });
  req.session.userName = "Anonymous";
  const colorScheme = req.session.colorScheme || "dark";
  console.log(colorScheme);
  res.render("home", { title: "Home" });
};

exports.about = (req, res) => {
  async function go() {
    try {
      const result = await mailTransport.sendMail({
        from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
        to: "alexmlnkv@gmail.com",
        subject: "Your Meadowlark Travel Tour",
        text:
          "Thank you for booking your trip with Meadowlark Travel.  " +
          "We look forward to your visit!",
      });
      console.log("mail sent successfully: ", result);
    } catch (err) {
      console.log("could not send mail: " + err.message);
    }
  }
  console.log(req.signedCookies.aloha);
  go();
  res.render("about", {
    title: "About",
    randomText: randomText.getRandomText(),
  });
};

exports.newsletter = (req, res) =>
  res.render("newsletter", {
    title: "News letter signup",
    csrf: "Token",
  });

exports.api.newsletterSignup = (req, res) => {
  console.log("CSRF token (from hidden form field): " + req.body._csrf);
  console.log("Name (from visible form field): " + req.body.name);
  console.log("Email (from visible form field): " + req.body.email);
  if (!req.body.name) {
    req.session.flash = {
      type: "danger",
      intro: "Error",
      message: "Error in Name",
    };
  }
  // для ajax
  //res.send({ result: "success" });

  return res.redirect(303, "/");
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
