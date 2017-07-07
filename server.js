

// declare express and cookieSession bodyParser and PORT

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));
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


function checkDatabase(database, cookies, params) {
  if (database[cookies].hasOwnProperty(params)) {
    return true;
  } else { return false; }
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
  if (reqCookies === urlDatabase[reqCookies]) { return true; }
}

app.get("/", (req, res) => {
  if (!cookieCheck(req.session.user_id)){
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

function urlCheck(url) {
  const re = /\bhttps?:\/\//;
  return re.test(url);
}


// GET login request
app.get('/login', (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id],
    user: (users[req.session.user_id])
  };
  if (req.session.user_id !== undefined) {
    return res.redirect("/urls");
  }
  res.render('urls_login', templateVars);
});

// GET request for registration
app.get('/register', (req, res) => {
  res.render('urls_register');
  let test = users[req.session.user_id];

});

// GET request for homepage
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id],
    user: (users[req.session.user_id])
  };
  if (req.session.user_id === undefined) {
    return res.render("urls_redirect", templateVars);
  }
  res.render("urls_index", templateVars);
});

// GET request for new URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }; if (req.session.user_id === undefined) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// GET request for id specific page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    lURL: urlDatabase[req.session.user_id][req.params.id],
    user: (users[req.session.user_id])
  };
  if (!checkDatabase(urlDatabase, req.session.user_id, req.params.id)) {
    res.status(401);
    return res.render("urls_forbidden", templateVars);
  }
  res.render('urls_show', templateVars);
});

// POST request to update database with new short URL
// RegEx to test whether url includes http:// at beginning only
app.post("/urls", (req, res) => {
  const shorty = generateRandomString();
  let longy = "";
  if (urlCheck(req.body.longURL)) {
    longy += req.body.longURL;
  } else {
    longy += `https://${req.body.longURL}`;
  }
  urlDatabase[req.session.user_id][shorty] = longy;
  res.redirect(`/urls/${shorty}`);
});

// POST request to delete URL
app.post("/urls/:id/delete", (req, res) => {
  if (!cookieCheck(req.session.user_id)) {
    delete urlDatabase[req.session.user_id][req.params.id];
  } res.redirect('/urls');
});

//POST request for editing longURL
app.post("/urls/:id", (req, res) => {
  if (!cookieCheck(req.session.user_id)) {
    urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
  }  res.redirect("/urls");

});

// POST request for login, stores user_id in cookies
app.post("/login", (req, res) => {
  currentUser = verifyUser(req.body.email, req.body.password);
  if (currentUser === undefined) {
    return res.status(400).send('Bad Request');
  } else { req.session.user_id = currentUser['id']; }

  res.redirect("/urls");
});

// POST request for logout, clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// POST request with registration data
app.post("/register", (req, res) => {
  if (req.body.email || req.body.password === "") {
    return res.status(400).send('Bad Request');

  }
  for (let user in users) {
    const currentUser = users[user];
    if (currentUser['email'] === req.body.email) {
      return res.status(400).send('Email already in use');
    }
  }
  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = randomID;
  res.redirect('/urls');
});

// GET request
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    user: (users[req.session.user_id])
  };
  let longURL = "";
  for (let user in urlDatabase) {
    let currentUser = urlDatabase[user];
    if (currentUser.hasOwnProperty(req.params.shortURL)) {
      longURL = longURL + currentUser[req.params.shortURL];
    }
  }
  res.redirect(longURL);
});

// server listening on PORT=8080
app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});