const express = require('express');
const router = express.Router();

const chatController = require('./chat.controller');
const authMiddleware = require('../auth/auth.middleware');

const isUser = authMiddleware.isUser;

// declare route
router.put('/:id', isUser, chatController.getAll);

module.exports = router;
