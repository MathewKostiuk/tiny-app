

// declare express and cookieParser bodyParser and PORT

const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// set ejs as view engine
app.set("view engine", "ejs");

// function for generating random URL


// 'Database'

const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca"
  },
  "user2RandomID": {
    "9sm5xK": "http://www.google.com"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "$2a$10$egEsYw8OXbvy9i3AU9Bsu.ukOHRCF8k66jLEz7y5MW5Xn5gm9kfAG"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "$2a$10$rVbXkED9fM5V9kolvAERAObnvFFt6XncNyr//XnedxnAL79.S1RKW"
  }
};

function generateRandomString() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let text = '';

  for (var i = 0; i < 6; i++) { text += chars.charAt(Math.floor(Math.random() * chars.length)); }
  return text;
}

function verifyUser(email, password) {
  for (let user in users) {
    let currentUser = users[user];
    if (currentUser['email'] === email && bcrypt.compareSync(password, currentUser['hashedPassword'])) {
      return currentUser;
    }
  }
}

function cookieCheck(reqCookies) {
  if (reqCookies['user_id'] === urlDatabase[reqCookies['user_id']]) { return true; }
}

app.get("/", (req, res) => {
  res.redirect("/login");
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

});

// GET request for homepage
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.cookies["user_id"]],
    user: (users[req.cookies["user_id"]])
  };
  res.render("urls_index", templateVars);
});

// GET request for new URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }; if (req.cookies["user_id"] === undefined) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// GET request for id specific page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    lURL: urlDatabase[req.cookies['user_id']][req.params.id],
    user: (users[req.cookies["user_id"]])
  };
  if (!req.cookies['user_id']) {
    return res.redirect("/login");
  }
  res.render("urls_show", templateVars);
});

// POST request to update database with new short URL
// RegEx to test whether url includes http:// at beginning only
app.post("/urls", (req, res) => {
  const shorty = generateRandomString();
  const re = /\bhttps?:\/\//;
  const longy = req.body.longURL;
  if (re.test(longy)) {
    return urlDatabase[req.cookies["user_id"]][shorty] = longy;
  } else {
    urlDatabase[req.cookies["user_id"]][shorty] = `https://${longy}`;
  }
  res.redirect(`/urls/${shorty}`);
});

// POST request to delete URL
app.post("/urls/:id/delete", (req, res) => {
  if (cookieCheck(req.cookies['user_id'])) {
    delete urlDatabase[req.cookies['user_id']][req.params.id];
  } res.redirect('/urls');
});

//POST request for editing longURL
app.post("/urls/:id", (req, res) => {
  if (cookieCheck(req.cookies['user_id'])) {
    urlDatabase[req.cookies['user_id']][req.params.id] = req.body.longURL;
  }  res.redirect("/urls");

});

// POST request for login, stores user_id in cookies
app.post("/login", (req, res) => {
  currentUser = verifyUser(req.body.email, req.body.password);
  if (currentUser === undefined) {
    return res.status(400).send('Bad Request');
  } else { res.cookie('user_id', currentUser['id']); }


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
    return res.status(400).send('Bad Request');

  }
  for (let user in users) {
    const uemail = users[user];
    if (uemail['email'] === req.body.email) {
      return res.status(400).send('Email already in use');
    }
  }
  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(req.body.password, 10)
  };
  console.log(users[randomID].hashedPassword);
  res.cookie('user_id', randomID);
  res.redirect('/urls');
});

// GET request
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    user: (users[req.cookies["user_id"]])
  };
  let longURL = "";
  for (let user in urlDatabase) {
    let currentUser = urlDatabase[user];
    if (currentUser.hasOwnProperty(req.params.shortURL)) {
      return longURL = longURL + currentUser[req.params.shortURL];
    }
  }
  res.redirect(longURL);
});

// server listening on PORT=8080
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});