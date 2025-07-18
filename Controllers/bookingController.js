const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const factory = require('../Controllers/handlerFactory');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/my-bookings?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    unit_amount: tour.price * 100,
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        session
    })
})

// exports.createBookingCheckout = catchAsync(async(req, res, next) => {
//     const {tour, user, price} = req.query;

//     if(!user || !tour || !price) return next();

//     await Booking.create({tour, user, price});
//     res.redirect(req.originalUrl.split('?')[0]);
// })

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne( {email: session.customer_email} )).id;
    const price = session.amount_total/100;
    await Booking.create( { tour, user, price } );
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch(err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if(event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);

    res.status(200).json( { received: true } );
};

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.createBooking = factory.createOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
