const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, productController.uploadMiddleware, productController.createProduct);
router.post('/:id/reviews', auth, productController.addReview);

module.exports = router;