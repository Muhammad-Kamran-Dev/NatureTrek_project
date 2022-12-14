const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');

// Param middleware will only run if url has an id
router.param('id', tourController.checkId);
// ROUTE:
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
