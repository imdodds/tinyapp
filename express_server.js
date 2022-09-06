const express = require("express");
const cookieParser = require("cookie-parser");
const { send } = require("express/lib/response");
const req = require("express/lib/request");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "test"
  },
  "9sm5xK" : {
    longURL: "http://www.google.com",
    userID: "test"
  },
  "np123" : {
    longURL: "http://www.neopets.com",
    userID: "12345678"
  }
};

const users = {
  userRandomID: {
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    id: "userRandomID"
  },
  user2RandomID: {
    email: "user2@example.com",
    password: "dishwasher-funk",
    id: "user2RandomID"
  },
  test: {
    email: "ianmitchelldodds@gmail.com",
    password: "123",
    id: "test"
  }
};

const generateRandomString = (length) => {

  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  } for (const key in urlDatabase) {
      if (key === result) {
        generateRandomString(length);
      }
  }
  return result;
};

const addNewURL = (longURL) => {
  const newID = generateRandomString(8);
  urlDatabase[newID] = {
    "longURL" : longURL
  }
  return urlDatabase[newID];
};

const getUserByEmail = (email) => {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

const urlsForUser = (id) => {

  let userURLs = {};

  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
};


// Root directory
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// User registration
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  // if user is logged in redirect to /urls
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("registration", templateVars);
  }});

// Registration Handler
app.post("/register", (req, res) => {

  // if email/password are empty strings return 400 status code
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid email or password");

  // if email already exists return 400 status code
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send("Email already exists");

  // register new user
  } else {
    const userID = generateRandomString(8);
    users[userID] = req.body;
    users[userID].id = userID;
    res.cookie("user_id", users[userID]);
    res.redirect("/urls");
  }
});

// User login
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  // if user is logged in redirect to /urls
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// Login Handler
app.post("/login", (req, res) => {

  // look up email in the user object
  if (getUserByEmail(req.body.email)) {
    const user = getUserByEmail(req.body.email);
    // compare passwords
    if (req.body.password === user.password) {
      // set user_id cookie and login
      res.cookie("user_id", user);
      res.redirect("/urls");
    } else {
      // if passwords do not match return 403 status code
      res.status(403).send("Invalid password");
    }
  } else {
    // if email not found return 403 status code
    res.status(403).send("Email not found");
  }
});

// Logout user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// Diplay urlDatabse
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { 
      urls: urlsForUser(req.cookies["user_id"].id),
      user: req.cookies["user_id"]
     };
    res.render("urls_index", templateVars);
  // if user is not logged in display prompt
  } else {
    res.send("You must be logged in to view this page");
  }
});

// Submit new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["user_id"]
   };
   // if user is not logged in redirect to login
   if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Add new URL to urlDatabase
app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let newURL = addNewURL(req.body.longURL);
    newURL.userID = req.cookies["user_id"].id;
    res.redirect("/urls");
  } else {
    res.send("You must be logged in to add a new URL");
  }
});

// Display long and short URLs
app.get("/urls/:id", (req, res) => {
  // if user is logged in check URL against user's URLs
  if (req.cookies["user_id"]) {
    const userURLs = urlsForUser(req.cookies["user_id"].id);
    const shortURL = req.params.id;
    if (userURLs) {
      for (let url in userURLs) {
        if (url === shortURL) {
          const templateVars = { 
            id: shortURL,
            longURL: urlDatabase[shortURL].longURL,
            user: req.cookies["user_id"]
           };
           res.render("urls_show", templateVars);
        } 
      }
    } else {
      res.send("You do not have permission to view this page");
    }
  // if user is not logged in display message
  } else {
    res.send("You must be logged in to view this page");
  }
});

// Redirect to Long URL
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send("URL not found");
  }
});

// Edit a URL
app.post("/urls/:id", (req, res) => {

  // return error message if id does not exist
  if (!urlDatabase[req.params.id]) {
    res.send("The page you are looking for could not be found")
  }
    // return error message if user does not own url
    else if (!urlsForUser(req.cookies["user_id"])) {
      console.log("you made it here!")
      res.send("You do not have permission to edit this URL");
    }
      // return error message if user is not logged in
      else if (!req.cookies["user_id"]) {
        res.send("You must be logged in to edit this URL");
      }
        else {
          const longURL = req.body.longURL;
          urlDatabase[req.params.id].longURL = longURL;
          res.redirect("/urls");
        }
});

// Delete a URL
app.post("/urls/:id/delete", (req, res) => {

  // return error message if id does not exist
  if (!urlDatabase[req.params.id]) {
    res.send("The page you are looking for could not be found")
  }
    // return error message if user does not own url
    else if (!urlsForUser(req.cookies["user_id"])) {
      res.send("You do not have permission to delete this URL");
    }
      // return error message if user is not logged in
      else if (!req.cookies["user_id"]) {
        res.send("You must be logged in to delete this URL");
      }
        else {
          delete urlDatabase[req.params.id];
          res.redirect("/urls");
        }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
