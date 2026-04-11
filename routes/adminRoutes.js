const express = require('express');
const router = express.Router();
const { 
    addUser, getUsers, deleteUser, getStats, getIssues, updateIssueStatus, 
    addSubject, getSubjects, addSchedule, getSchedules, addNotice, getNotices, resetPassword 
} = require('../controllers/adminController');
const { adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/users', adminMiddleware, addUser);
router.get('/users', adminMiddleware, getUsers);
router.delete('/users/:id', adminMiddleware, deleteUser);
router.post('/users/:id/reset-password', adminMiddleware, resetPassword);

router.get('/stats', adminMiddleware, getStats);
router.get('/issues', adminMiddleware, getIssues);
router.patch('/issues/:id', adminMiddleware, updateIssueStatus);

router.post('/subjects', adminMiddleware, addSubject);
router.get('/subjects', adminMiddleware, getSubjects);

router.post('/schedules', adminMiddleware, addSchedule);
router.get('/schedules', adminMiddleware, getSchedules);

router.post('/notices', adminMiddleware, addNotice);
router.get('/notices', adminMiddleware, getNotices);

module.exports = router;
