const express = require('express');

const {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,checkId
} = require('../controllers/tourController');

const router = express.Router();

// Param middleware will only run if url has an id 
router.param('id',checkId);

// ROUTE: 
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;