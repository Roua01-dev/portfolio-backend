const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public route - Create message (contact form)
router.post('/', messageController.createMessage);

// Protected routes (Admin only)
router.use(authMiddleware.authenticate, authMiddleware.authorize('admin'));

router.get('/', messageController.getAllMessages);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:id', messageController.getMessageById);
router.patch('/:id/read', messageController.markAsRead);
router.patch('/:id/unread', messageController.markAsUnread);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;