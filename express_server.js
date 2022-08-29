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

// Root directory
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// User login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//User logout
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
})

// Diplay urlDatabse
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
  res.render("urls_index", templateVars);
});

// User submits new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
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
    username: req.cookies["username"]
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
