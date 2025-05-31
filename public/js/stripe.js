/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51RT2X9R7OZZIVCxDnf8DdIZX68UHgNcpWop6hLw2OtGcbv4OHwzNG32LVTRO9VCkVUToqtAigMnlrKRFe3EFh9Iz00XyQ4M2VT');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};