const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let repCount = 0; 

app.get('/count', (req, res) => {
  res.json({ count: repCount });
});

app.post('/count', (req, res) => {
  const { count } = req.body;
  if (typeof count === 'number' && count >= 0) {
    repCount = count;
    res.json({ message: 'Count updated', count: repCount });
  } else {
    res.status(400).json({ message: 'Invalid count value' });
  }
});

app.post('/reset', (req, res) => {
  repCount = 0;
  res.json({ message: 'Count reset', count: repCount });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
