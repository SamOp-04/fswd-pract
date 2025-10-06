const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// GET route to render form
app.get("/", (req, res) => {
  res.render("form", { error: null });
});

// POST route to handle form submission
app.post("/calculate", (req, res) => {
  const income1 = req.body.income1;
  const income2 = req.body.income2;

  // Validation: numbers and non-negative
  if (
    isNaN(income1) ||
    isNaN(income2) ||
    income1.trim() === "" ||
    income2.trim() === ""
  ) {
    return res.render("form", { error: "Please enter valid numbers." });
  }

  const total = parseFloat(income1) + parseFloat(income2);

  res.render("result", { income1, income2, total });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
