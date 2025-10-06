const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// View all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ dateJoined: -1 });
    res.render('index', { students });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add student form
router.get('/add', (req, res) => {
  res.render('add');
});

// Add student
router.post('/add', async (req, res) => {
  try {
    const { name, email, phone, course, feeStatus } = req.body;
    const student = new Student({ name, email, phone, course, feeStatus });
    await student.save();
    res.redirect('/');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Edit student form
router.get('/edit/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.render('edit', { student });
  } catch (err) {
    res.status(404).send('Student not found');
  }
});

// Update student
router.post('/edit/:id', async (req, res) => {
  try {
    const { name, email, phone, course, feeStatus } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { name, email, phone, course, feeStatus });
    res.redirect('/');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete student
router.get('/delete/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
