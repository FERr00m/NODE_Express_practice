const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');

//производят парсинг тела запроса, закодированного с помощью multipart/form-data.
const multiparty = require('multiparty');

const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

const handlers = require('./lib/handlers');
const weatherMiddlware = require('./lib/middleware/weather');
const flashMiddleware = require('./lib/middleware/flash');
const { credentials } = require('./config');

require('./db');

const app = express();

Sentry.init({
  dsn: credentials.sentry.dsn,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

switch (app.get('env')) {
  case 'development':
    app.use(morgan('dev'));
    break;
  case 'production':
    const stream = fs.createWriteStream(
      path.join(__dirname, 'var/log/access.log'),
      {
        flags: 'a',
      }
    );
    app.use(morgan('combined', { stream }));
    break;
}

// Удаляем заголовок ответа сервера (небольшая защита против хакеров, чтобы было не понятно на каком движке сервер)
app.disable('x-powered-by');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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

app.use(express.static(path.join(__dirname, '/public')));
app.use(weatherMiddlware);
app.use(flashMiddleware);

const port = process.env.PORT || 8000;

app.get('/', handlers.home);

app.get('/about', handlers.about);

app.get('/headers', (req, res) => {
  console.log(req.originalUrl);
  res.type('text/plain');
  const headers = Object.entries(req.headers).map(
    ([key, value]) => `${key}: ${value}`
  );
  res.send(headers.join('\n'));
});

app.get('/newsletter', handlers.newsletter);

app.post('/api/newsletter-signup', handlers.api.newsletterSignup);

app.get('/contest/vacation-photo-ajax', handlers.vacationPhotoContestAjax);

// Запрос с вызовом ошибки и логирования в Sentry
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err)
      return handlers.api.vacationPhotoContestError(req, res, err.message);
    handlers.api.vacationPhotoContest(req, res, fields, files);
  });
});

app.get('/cart/checkout', handlers.cartChekout);

app.get('/vacations', handlers.listVacations);

//app.use(Sentry.Handlers.errorHandler());

// custom 404 page
app.use(handlers.notFound);

// custom 500 page
app.use(handlers.serverError);

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Express started on http://localhost:${port}` +
        '; press Ctrl-C to terminate.'
    );
  });
} else {
  module.exports = app;
}
