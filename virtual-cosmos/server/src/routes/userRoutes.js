// src/routes/userRoutes.js
// SRP: Route definitions only — delegates to controller.
// OCP: New routes can be added without modifying the controller.
const express = require('express');
const { registerUser, getUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.get('/', getUsers);

module.exports = router;
