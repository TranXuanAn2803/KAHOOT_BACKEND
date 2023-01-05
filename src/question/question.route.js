const express = require('express');
const router = express.Router();

const questionController = require('./question.controller');
const authMiddleware = require('../auth/auth.middleware');

const isUser = authMiddleware.isUser;

// declare route
router.put('/:id', isUser, questionController.getAll);

module.exports = router;
