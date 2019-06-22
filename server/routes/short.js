const express = require('express');
const router = express.Router();

module.exports = function(Helpers, Constants) {
  const db = Constants.urlDatabase;
  const users = Constants.users;

  router.get("/:shortURL", (req, res) => {
    let templateVars = {
      user: (users[req.session.user_id])
    };
    const redirectURL = Helpers.getUrlFromDatabase(db, req);
    res.redirect(redirectURL);
  });
  return router;
}
