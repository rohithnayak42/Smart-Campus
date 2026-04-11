const express = require('express');
const router = express.Router();
const { addUser, getUsers, deleteUser } = require('../controllers/adminController');
const { adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/users', adminMiddleware, addUser);
router.get('/users', adminMiddleware, getUsers);
router.delete('/users/:id', adminMiddleware, deleteUser);

module.exports = router;
