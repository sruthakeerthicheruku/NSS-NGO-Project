const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/initiate', protect, async (req, res) => {
  const { amount } = req.body;
  try {
    // Create a record marked as PENDING immediately
    const donation = new Donation({
      user: req.user.userId,
      amount,
      status: 'pending'
    });
    await donation.save();

    
    res.json({
      donationId: donation._id,
      message: "Initialization successful. Proceed to payment gateway."
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/verify-payment', protect, async (req, res) => {
  const { donationId, simulatedStatus } = req.body;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ msg: 'Donation not found' });

    // Update status based on the "Gateway" response
    donation.status = simulatedStatus;
    donation.transactionId = `TXN_${Date.now()}`; 
    donation.gatewayResponse = { message: "Payment Verified via Sandbox" };

    await donation.save();

    res.json({ msg: `Donation marked as ${simulatedStatus}`, donation });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/my-history', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


router.get('/all', protect, admin, async (req, res) => {
  try {
   
    const donations = await Donation.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
