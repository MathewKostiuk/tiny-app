const express = require('express');
const router = express.Router();

module.exports = function(Helpers, Constants) {
  const db = Constants.urlDatabase;
  const users = Constants.users;
  // GET request for homepage
  router.get("/", (req, res) => {
    let templateVars = {
      urls: db[req.session.user_id],
      user: users[req.session.user_id]
    };
    if (req.session.user_id === undefined) {
      return res.render("urls_redirect", templateVars);
    }
    res.render("urls_index", templateVars);
  });

  // GET request for new URL page
  router.get("/new", (req, res) => {
    let templateVars = {
      user: users[req.session.user_id]
    };
    if (req.session.user_id === undefined) {
      return res.redirect("/login");
    }
    res.render("urls_new", templateVars);
  });

  // GET request for id specific page
  router.get("/:id", (req, res) => {
    let templateVars = {
      shortURL: req.params.id,
      lURL: db[req.session.user_id][req.params.id],
      user: (users[req.session.user_id])
    };
    if (!Helpers.checkDatabase(db, req.session.user_id, req.params.id)) {
      res.status(401);
      return res.render("urls_forbidden", templateVars);
    }
    res.render('urls_show', templateVars);
  });

  // POST request to update database with new short URL

  // Use urlCheck function to check for http://


  router.post("/", (req, res) => {
    const shorty = Helpers.generateRandomString();
    let longy = "";
    if (Helpers.urlCheck(req.body.longURL)) {
      longy += req.body.longURL;
    } else {
      longy += `https://${req.body.longURL}`;
    }
    db[req.session.user_id][shorty] = longy;
    res.redirect(`/urls/${shorty}`);
  });

  // POST request to delete URL
  router.post("/:id/delete", (req, res) => {
    if (!Helpers.cookieCheck(req.session.user_id)) {
      delete db[req.session.user_id][req.params.id];
    } res.redirect('/urls');
  });

  //POST request for editing longURL
  router.post("/:id", (req, res) => {
    if (!Helpers.cookieCheck(req.session.user_id)) {
      db[req.session.user_id][req.params.id] = req.body.longURL;
    } res.redirect("/urls");

  });

  return router;
}

