

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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

// GET login request
app.get('/login', (req, res) => {
  let templateVars = {
    user: (users[req.cookies["user_id"]])
  };
  res.render('urls_login', templateVars);
});

// GET request for registration
app.get('/register', (req, res) => {
  res.render('urls_register');
  let test = users[req.cookies["user_id"]];
  console.log(test);

});

// GET request for homepage
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: (users[req.cookies["user_id"]])
  };
  res.render("urls_index", templateVars);
});

// GET request for new URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: JSON.stringify((users[req.cookies["user_id"]]))
  }; if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// GET request for id specific page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    lURL: urlDatabase[req.params.id],
    user: JSON.stringify((users[req.cookies["user_id"]]))
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

// POST request for login, stores user_id in cookies
app.post("/login", (req, res) => {
  console.log(req.body.email, req.body.password);
  for (let user in users) {
    const currentUser = users[user];
      if (currentUser['email'] === req.body.email && currentUser['password'] === req.body.password) {
          res.cookie("user_id", currentUser['id']);
        break;
      } else res.status(403).send("Forbidden");
  }
  res.redirect("/urls");
});

// POST request for logout, clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// POST request with registration data
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password === "") {
    res.status(400).send('Bad Request');
    return;
  }
  for (let user in users) {
    const uemail = users[user];
      if (uemail['email'] === req.body.email) {
          res.status(400).send('Email already in use');
      }
  }
  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', randomID);
  res.redirect('/urls');
});

// GET request
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    user: JSON.stringify((users[req.cookies["user_id"]]))
  };
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// server listening on PORT=8080
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});