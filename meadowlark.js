const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

//производят парсинг тела запроса, закодированного с помощью multipart/form-data.
const multiparty = require("multiparty");

const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

const handlers = require("./lib/handlers");
const weatherMiddlware = require("./lib/middleware/weather");
const flashMiddleware = require("./lib/middleware/flash");
const { credentials } = require("./config");

const app = express();

// Удаляем заголовок ответа сервера (небольшая защита против хакеров)
app.disable("x-powered-by");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// производит парсинг тела HTTP-запроса. Это необходимо, чтобы парсить например веб-формы
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser(credentials.cookieSecret));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
  })
);

app.use(express.static(path.join(__dirname, "/public")));
app.use(weatherMiddlware);
app.use(flashMiddleware);

const port = process.env.PORT || 8000;

app.get("/", handlers.home);

app.get("/about", handlers.about);

app.get("/headers", (req, res) => {
  console.log(req.originalUrl);
  res.type("text/plain");
  const headers = Object.entries(req.headers).map(
    ([key, value]) => `${key}: ${value}`
  );
  res.send(headers.join("\n"));
});

app.get("/newsletter", handlers.newsletter);

app.post("/api/newsletter-signup", handlers.api.newsletterSignup);

app.get("/contest/vacation-photo-ajax", handlers.vacationPhotoContestAjax);

app.post("/api/vacation-photo-contest/:year/:month", (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err)
      return handlers.api.vacationPhotoContestError(req, res, err.message);
    handlers.api.vacationPhotoContest(req, res, fields, files);
  });
});

// custom 404 page
app.use(handlers.notFound);

// custom 500 page
app.use(handlers.serverError);

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Express started on http://localhost:${port}` +
        "; press Ctrl-C to terminate."
    );
  });
} else {
  module.exports = app;
}
