const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  urlDatabase[newID] = longURL;
  return newID;
};

const getUserByEmail = (email) => {
  for (user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};


// Root directory
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// User registration
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  res.render("registration", templateVars);
});

// Registration Handler
app.post("/register", (req, res) => {

  // if email/password are empty strings return 400 status code
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid username or password");

  // if email already exists return 400 status code
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send("Username already exists");

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
  res.render("login", templateVars);
})

// Login user
app.post("/login", (req, res) => {
  res.cookie("users", req.body.email);
  res.redirect("/urls");
});

// Logout user
app.post("/logout", (req, res) => {
  res.clearCookie("users")
  res.redirect("/urls");
})

// Diplay urlDatabse
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["user_id"]
   };
  res.render("urls_index", templateVars);
});

// Submit new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["user_id"]
   };
  res.render("urls_new", templateVars);
});

// Add new URL to urlDatabase
app.post("/urls", (req, res) => {
  let newID = addNewURL(req.body.longURL);
  res.redirect("/urls");
});

// Display long and short URLs
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_id"]
   };
  res.render("urls_show", templateVars);
});

// Redirect to Long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL)
});

//Edit a URL
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

// Delete a URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

// Start Server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
