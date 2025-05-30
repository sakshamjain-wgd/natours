const express = require('express');
const tourController = require('./../Controllers/tourController');
const authController = require('../Controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkId);

router.use('/:tourId/reviews', reviewRouter);

router
   .route('/top-5-affordable')
   .get(tourController.aliasTopTours, tourController.getAllTours)


router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan').get(
   authController.protect,
   authController.restrictTo('admin', 'lead-guide', 'guide'),
   tourController.getMonthlyPlan);

router
   .route('/')
   .get(authController.protect, tourController.getAllTours)
   .post(tourController.createTour)

router
   .route('/tours-within/:distance/center/:latlng/unit/:unit')
   .get(tourController.getToursWithin);

router
   .route('/:id')
   .get(tourController.getTour)
   .patch(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.uploadTourImages,
      tourController.resizeTourImages,
      tourController.updateTour)
   .delete(authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.uploadTourImages,
      tourController.deleteTour)

module.exports = router