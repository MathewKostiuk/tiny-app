const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const path = require('path');
const Helpers = require('./lib/helpers');
const Constants = require('./lib/constants');
const urlRoutes = require('./routes/urls')(Helpers, Constants);
const authRoutes = require('./routes/auth')(Helpers, Constants);
const shortURLRoutes = require('./routes/short')(Helpers, Constants);

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));
// set ejs as view engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '../views'));

app.use("/urls", urlRoutes);
app.use("/shorty", shortURLRoutes);
app.use("/", authRoutes);

// server listening on PORT=8080
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});