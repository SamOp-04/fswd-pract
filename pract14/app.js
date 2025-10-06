const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// Storage: save in "uploads" with original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter: allow only PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed!"));
  }
};

// Multer middleware (2MB limit)
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
});

app.post("/upload", (req, res) => {
  upload.single("resume")(req, res, (err) => {
    const renderMessage = (title, message, color) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Resume Upload</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            text-align: center;
            width: 350px;
          }
          h2 {
            margin-bottom: 20px;
            color: #444;
          }
          .msg {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            background: ${color};
            color: #fff;
            font-weight: bold;
          }
          a {
            text-decoration: none;
            background: #667eea;
            color: #fff;
            padding: 10px 20px;
            border-radius: 8px;
            display: inline-block;
            transition: background 0.3s ease;
          }
          a:hover {
            background: #5563c1;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${title}</h2>
          <div class="msg">${message}</div>
          <a href="/">Go Back</a>
        </div>
      </body>
      </html>
    `;

    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send(renderMessage("Error", "File too large. Max size is 2MB.", "#e74c3c"));
      }
      return res.status(400).send(renderMessage("Error", err.message, "#e74c3c"));
    }

    if (!req.file) {
      return res.status(400).send(renderMessage("Error", "No file uploaded.", "#e74c3c"));
    }

    res.send(renderMessage("Success", `Upload successful: ${req.file.filename}`, "#2ecc71"));
  });
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Resume Upload</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background: #fff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          text-align: center;
          width: 350px;
        }
        h2 {
          margin-bottom: 20px;
          color: #444;
        }
        input[type="file"] {
          display: block;
          margin: 15px auto;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          width: 90%;
        }
        button {
          background: #667eea;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        button:hover {
          background: #5563c1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Upload Your Resume</h2>
        <form action="/upload" method="POST" enctype="multipart/form-data">
          <input type="file" name="resume" required />
          <button type="submit">Upload</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
