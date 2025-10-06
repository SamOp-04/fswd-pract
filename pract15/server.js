const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "library_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }, 
  })
);

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.send("Username is required!");
  }

  req.session.user = {
    name: username,
    loginTime: new Date().toLocaleString(),
  };

  res.redirect("/profile");
});

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.render("profile", { user: req.session.user });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
