const express = require('express')
const path = require('path')

const randomText = require('./lib/randomText.js')

const app = express()

app.set("views", path.join(__dirname, 'views'))
app.set("view engine", "pug")

app.use(express.static(path.join(__dirname, '/public')))

const port = process.env.PORT || 8000

app.get('/', (req, res) => {
  res.render("home", { title: "Home", randomText: randomText.getRandomText() })
})

app.get('/about', (req, res) => res.render("about", { title: "About" }))

// custom 404 page
app.use((req, res) => {
  res.status(404)
  res.render('404', { title: '404' })
})

// custom 500 page
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500)
  res.render('500', { title: '500' })
})

app.listen(port, () => console.log(
  `Express started on http://localhost:${port}; ` +
  `press Ctrl-C to terminate.`))
