const Review = require('./../models/reviewModel');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.checkIfBooked = catchAsync(async(req, res, next)=> {
  const tourId = req.body.tour;

  const userId = req.user.id;

  // console.log(tourId);
  
  const booking = await Booking.findOne( {tour: tourId, user: userId} );

  if(!booking) return next(new AppError('You can review only the tours that you have booked.', 403));

  next();
})

exports.setHasBookedFlag = catchAsync(async (req, res, next) => {
  if (!res.locals.user) {
    res.locals.hasBooked = false;
    return next();
  }

  const tour = await Tour.findOne({ slug: req.params.slug });
  if (!tour) return next(new AppError('No tour found with that slug', 404));

  const booking = await Booking.findOne({
    tour: tour._id,
    user: res.locals.user._id
  });

  res.locals.hasBooked = !!booking;
  next();
});

exports.setHasReviewedFlag = catchAsync(async (req, res, next) => {
  if (!res.locals.user) {
    res.locals.hasReviewed = false;
    return next();
  }

  const tour = await Tour.findOne({ slug: req.params.slug });
  if (!tour) return next(new AppError('No tour found with that slug', 404));

  const review = await Review.findOne({
    tour: tour._id,
    user: res.locals.user._id
  });

  res.locals.userReview = review;
  res.locals.hasReviewed = !!review;
  next();
});


exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);