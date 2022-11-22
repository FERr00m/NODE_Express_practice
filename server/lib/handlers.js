const db = require('../db');

exports.api = {};

const randomText = require('./randomText');
const smtp = require('../smtp');

// slightly modified version of the official W3C HTML5 email regex:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
const VALID_EMAIL_REGEX = new RegExp(
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@" +
    '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
    '(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
);

exports.home = (req, res) => {
  req.session.cart = {
    items: [
      { id: '82RgrqGCAHqCf6rA2vujbT', qty: 1, guests: 2 },
      { id: 'bqBtwqxpB4ohuxCBXRE9tq', qty: 1 },
    ],
  };

  res.cookie('aloha', 'hello', { signed: true });
  req.session.userName = 'Anonymous';
  const cart = req.session.cart;
  const colorScheme = req.session.colorScheme || 'dark';
  console.log('cart ', cart);
  console.log(colorScheme);
  res.render('home', { title: 'Home' });
};

exports.about = (req, res) => {
  //smtp.send("alexmlnkv@gmail.com", "Subject");
  console.log(req.signedCookies.aloha);
  let x = db.getVacationBySku({ sku: 'HR199' });
  console.log('x ', x);
  res.render('about', {
    title: 'About',
    randomText: randomText.getRandomText(),
  });
};

exports.newsletter = (req, res) =>
  res.render('newsletter', {
    title: 'News letter signup',
    csrf: 'Token',
  });

exports.cartChekout = (req, res, next) => {
  const cart = req.session.cart;
  if (!cart) next(new Error('Cart does not exist.'));
  const name = 'Alex' || '',
    email = 'alexmlnkv@gmail.com' || '';
  // input validation
  if (!email.match(VALID_EMAIL_REGEX))
    return res.next(new Error('Invalid email address.'));
  // assign a random cart ID; normally we would use a database ID here
  cart.number = Math.random()
    .toString()
    .replace(/^0\.0*/, '');
  cart.billing = {
    name: name,
    email: email,
  };
  res.render(
    'email/cart-thank-you',
    { layout: null, cart: cart },
    (err, html) => {
      console.log('rendered email: ', html);
      if (err) console.log('error in email template');

      smtp
        .send(
          cart.billing.email,
          'Thank You for Book your Trip with Meadowlark Travel',
          html
        )
        .then((info) => {
          console.log('sent! ', info);
          res.render('cart-thank-you', { cart: cart });
        })
        .catch((err) => {
          console.error('Unable to send confirmation: ' + err.message);
        });
    }
  );
};

exports.api.newsletterSignup = (req, res) => {
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  if (!req.body.name) {
    req.session.flash = {
      type: 'danger',
      intro: 'Error',
      message: 'Error in Name',
    };
  }
  // для ajax
  //res.send({ result: "success" });

  return res.redirect(303, '/');
};

exports.vacationPhotoContest = (req, res) => {
  const now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};
exports.vacationPhotoContestAjax = (req, res) => {
  const now = new Date();
  res.render('contest/vacation-photo-ajax', {
    csrf: 'Tokken',
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};

const pathUtils = require('path');
const fs = require('fs');

// create directory to store vacation photos (if it doesn't already exist)
const dataDir = pathUtils.resolve(__dirname, '..', 'data');
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir);

function saveContestEntry(contestName, email, year, month, photoPath) {
  // TODO...this will come later
}

// we'll want these promise-based versions of fs functions in our async function
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);

exports.api.vacationPhotoContest = async (req, res, fields, files) => {
  try {
    const photo = files.photo[0];
    const dir = vacationPhotosDir + '/' + Date.now();
    const path = dir + '/' + photo.originalFilename;
    await mkdir(dir);
    await rename(photo.path, path);
    saveContestEntry(
      'vacation-photo',
      fields.email,
      req.params.year,
      req.params.month,
      path
    );
    console.log('field data: ', fields);
    console.log('files: ', files);
    res.send({ result: 'success' });
  } catch (e) {
    console.log('!ERROR! ', e);
  }
};
exports.api.vacationPhotoContestError = (req, res, message) => {
  res.send({ result: 'error', error: message });
};

function convertFromUSD(value, currency) {
  switch (currency) {
    case 'USD':
      return value * 1;
    case 'GBP':
      return value * 0.79;
    case 'BTC':
      return value * 0.000078;
    default:
      return NaN;
  }
}

exports.listVacations = async (req, res) => {
  const vacations = await db.getVacations({ available: true });

  const currency = req.session.currency || 'USD';
  const context = {
    currency: currency,
    vacations: vacations.map((vacation) => {
      return {
        sku: vacation.sku,
        name: vacation.name,
        description: vacation.description,
        inSeason: vacation.inSeason,
        price: convertFromUSD(vacation.price, currency),
        qty: vacation.qty,
      };
    }),
  };
  switch (currency) {
    case 'USD':
      context.currencyUSD = 'selected';
      break;
    case 'GBP':
      context.currencyGBP = 'selected';
      break;
    case 'BTC':
      context.currencyBTC = 'selected';
      break;
  }
  res.render('vacations', { context });
};

// note that this redirects to the /vacations page, but may
// want to use on // other pages!  should fix....
exports.setCurrency = (req, res) => {
  req.session.currency = req.params.currency;
  return res.redirect(303, '/vacations');
};

exports.notifyWhenInSeasonForm = (req, res) =>
  res.render('notify-me-when-in-season', { sku: req.query.sku });

exports.notifyWhenInSeasonProcess = async (req, res) => {
  const { email, sku } = req.body;
  await db.addVacationInSeasonListener(email, sku);
  return res.redirect(303, '/vacations');
};

exports.getVacationsApi = async (req, res) => {
  const vacations = await db.getVacations({ available: true });
  res.json(vacations);
};

exports.getVacationBySkuApi = async (req, res) => {
  const vacation = await db.getVacationBySku({ sku: req.params.sku });
  res.json(vacation);
};

exports.addVacationInSeasonListenerApi = async (req, res) => {
  await db.addVacationInSeasonListener(req.params.sku, req.body.email);
  res.json({ message: 'success' });
};

exports.requestDeleteVacationApi = async (req, res) => {
  const { email, notes } = req.body;
  res.status(500).json({ message: 'not yet implemented' });
};

// custom 404 page
exports.notFound = (req, res) => {
  res.status(404).render('404', { title: '404' });
};

// custom 500 page
exports.serverError = (err, req, res, next) => {
  console.error(err.message);
  res.status(500).render('500', { title: '500' });
};
