

// declare express and cookieParser bodyParser and PORT

const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// set ejs as view engine
app.set("view engine", "ejs");

// function for generating random URL

function generateRandomString() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let text = '';

  for (var i = 0; i < 6; i++) { text += chars.charAt(Math.floor(Math.random() * chars.length)); }
  return text;
}

// 'Database'

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

// GET request for homepage
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// GET request for new URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// GET request for id specific page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    lURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// POST request to update database with new short URL
// RegEx to test whether url includes http:// at beginning only
app.post("/urls", (req, res) => {
  const shorty = generateRandomString();
  const re = /\bhttps?:\/\//;
  const longy = req.body.longURL;
  if (re.test(longy)) {
    urlDatabase[shorty] = longy;
  } else {
    urlDatabase[shorty] = `https://${longy}`;
  }
  res.redirect(`/urls/${shorty}`);
});

// POST request to delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//POST request for updating longURL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// POST request for login, stores username in cookies
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

// POST request for logout, clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// GET request
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// server listening on PORT=8080
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});