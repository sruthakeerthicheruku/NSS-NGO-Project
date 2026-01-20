const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. Initiate Donation (User Intent)
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

    // In a real scenario, you would call Stripe/Razorpay API here to get a PaymentIntent ID
    // For this project, we return the donation ID to the frontend to simulate payment
    res.json({
      donationId: donation._id,
      message: "Initialization successful. Proceed to payment gateway."
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 2. Webhook/Verification (Simulating Gateway Callback)
// In a real app, the Payment Gateway calls this URL.
router.post('/verify-payment', protect, async (req, res) => {
  const { donationId, simulatedStatus } = req.body; // simulatedStatus: 'success' or 'failed'

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ msg: 'Donation not found' });

    // Update status based on the "Gateway" response
    donation.status = simulatedStatus;
    donation.transactionId = `TXN_${Date.now()}`; // Mock Transaction ID
    donation.gatewayResponse = { message: "Payment Verified via Sandbox" };

    await donation.save();

    res.json({ msg: `Donation marked as ${simulatedStatus}`, donation });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 3. User History
router.get('/my-history', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 4. Admin: View All Donations
router.get('/all', protect, admin, async (req, res) => {
  try {
    // Populate user details to see WHO donated
    const donations = await Donation.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;