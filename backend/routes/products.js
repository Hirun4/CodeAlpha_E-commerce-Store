const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, admin, productController.uploadMiddleware, productController.createProduct);
router.put('/:id', auth, admin, productController.uploadMiddleware, productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);
router.post('/:id/reviews', auth, productController.addReview);
router.delete('/:id/reviews', auth, productController.deleteReview);

module.exports = router;