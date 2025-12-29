// backend/routes/reviews.js
import express from 'express';
import Review from '../models/Review.js';
import { protect } from '../middlewares/authMiddleware.js'; // ✅ Fixed import

const router = express.Router();

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Add a new review (requires authentication)
router.post('/', protect, async (req, res) => { // ✅ Changed auth to protect
  try {
    const { productId, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      productId,
      userId: req.user._id,
      rating,
      comment,
      userName: req.user.name
    });

    await review.save();
    
    // Populate user info before sending response
    await review.populate('userId', 'name email');
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

// Update a review (requires authentication)
router.put('/:id', protect, async (req, res) => { // ✅ Changed auth to protect
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await review.populate('userId', 'name email');
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review (requires authentication)
router.delete('/:id', protect, async (req, res) => { // ✅ Changed auth to protect
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

export default router;