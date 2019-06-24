"use strict";
const bcrypt = require('bcrypt');

module.exports = {
  generateRandomString: function () {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let text = '';

    for (var i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  },
  checkDatabase: function(database, userId, urlId) {
    if (database[userId].hasOwnProperty(urlId)) {
      return true;
    } else {
      return false;
    }
  },
  verifyUser: function(email, password, users) {
    for (let user in users) {
      let currentUser = users[user];
      if (currentUser['email'] === email && bcrypt.compareSync(password, currentUser['hashedPassword'])) {
        return currentUser;
      }
    }
  },
  cookieCheck: function(reqCookies, urlDatabase) {
    if (reqCookies === urlDatabase[reqCookies]) { return true; }
  },
  urlCheck: function(url) {
    const re = /\bhttps?:\/\//;
    return re.test(url);
  },
  getUrlFromDatabase: function(db, req) {
    let longURL = "";
    for (let user in db) {
      let currentUser = db[user];
      if (currentUser.hasOwnProperty(req.params.shortURL)) {
        longURL = longURL + currentUser[req.params.shortURL];
      }
    }
    return longURL;
  },
  registerNewUser: function(db, users, Helpers, req) {
    // Create new entry in 'users' with bcrypt password
    req.session.user_id = this.generateRandomString();
    users[req.session.user_id] = {
      id: req.session.user_id,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    };
    // Create spot for new user in URL database
    db[req.session.user_id] = {};
  }
}