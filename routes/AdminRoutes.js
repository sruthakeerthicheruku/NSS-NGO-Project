const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Aggregate total successful donation amount
    const donationStats = await Donation.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const totalDonations = donationStats.length > 0 ? donationStats[0].totalAmount : 0;
    const successfulCount = donationStats.length > 0 ? donationStats[0].count : 0;

    res.json({
      totalUsers,
      totalDonations,
      successfulTransactions: successfulCount
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;