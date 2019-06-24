const express = require('express');
const router = express.Router();

module.exports = function(Helpers, Constants) {

  const db = Constants.urlDatabase;
  const users = Constants.users;

  router.get("/", (req, res) => {
    if (!Helpers.cookieCheck(req.session.user_id, db)) {
      return res.redirect("/urls");
    }
    res.redirect("/login");
  });

  // GET login request
  router.get('/login', (req, res) => {
    let templateVars = {
      urls: db[req.session.user_id],
      user: (users[req.session.user_id])
    };
    if (req.session.user_id !== undefined) {
      return res.redirect("/urls");
    }
    res.render('urls_login', templateVars);
  });

  // GET request for registration
  router.get('/register', (req, res) => {
    let templateVars = {
      urls: db[req.session.user_id],
      user: (users[req.session.user_id])
    };
    res.render('urls_register', templateVars);
    let test = users[req.session.user_id];

  });

  // POST request for login, stores user_id in cookies
  router.post("/login", (req, res) => {
    currentUser = Helpers.verifyUser(req.body.email, req.body.password, users);
    if (currentUser === undefined) {
      return res.status(400).send('Invalid entry, please go back and try again.');
    } else { req.session.user_id = currentUser['id']; }

    res.redirect("/urls");
  });

  // POST request for logout, clears cookies
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect('/urls');
  });

  // POST request with registration data
  router.post("/register", (req, res) => {
    if ((req.body.email === "") || (req.body.password === "")) {
      return res.status(400).send('Bad Request');
    }
    // Check for email availability
    for (let user in users) {
      const currentUser = users[user];
      if (currentUser['email'] === req.body.email) {
        return res.status(400).send('Email already in use');
      }
    }
    Helpers.registerNewUser(db, users, Helpers, req);

    res.redirect('/urls');
  });

  return router;
}
