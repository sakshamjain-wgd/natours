/* eslint-disable */
import '@babel/polyfill';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { createReview } from '../js/review';
import { deleteReview } from '../js/review';
import { showAlert } from './alerts';
import axios from 'axios';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const reviewForm = document.querySelector('.form--review');
const reviewDeleteBtns = document.querySelectorAll('.delete-review');
// const editBtns = document.querySelectorAll('.btn--edit-review');
// const saveEditBtn = document.getElementById('save-review')



if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
  

  if(bookBtn)
    bookBtn.addEventListener('click', e => {   
      e.target.textContent = 'Processing...'
      const { tourId } = e.target.dataset;
      bookTour(tourId);
  });
  
  if(signupForm)
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;

      signup(name, email, password, passwordConfirm);
  });

  if(reviewForm)
    reviewForm.addEventListener('submit', e => {
      e.preventDefault();
      const review = document.getElementById('review').value;
      const rating = document.getElementById('rating').value;
      const { tourId } = e.target.dataset;

      createReview(review, rating, tourId);  
  });

  if (reviewDeleteBtns.length) {
  reviewDeleteBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const { reviewId } = e.target.dataset;
      if (reviewId) deleteReview(reviewId);
    });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const editBtns = document.querySelectorAll('.btn--edit-review');

  editBtns.forEach(btn => {

    btn.addEventListener('click', () => {
      const reviewId = btn.dataset.reviewId;
      const reviewContent = btn.dataset.reviewContent;
      const reviewRating = btn.dataset.reviewRating;

      const card = btn.closest('.card'); 
      const reviewCard = card.querySelector('.reviews__card');

      if (!reviewCard) return;

      reviewCard.innerHTML = `
        <form class="form">
          <div class="form__group">
            <textarea id="edit-review-text" class="form__input" rows="3">${reviewContent}</textarea>
          </div>
          <div class="form__group">
            <label for="edit-review-rating">Rating</label>
            <select id="edit-review-rating" class="form__input">
              ${[1,2,3,4,5].map(r => `<option value="${r}" ${r == reviewRating ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn--edit-review" id="save-review">Save</button>
          <button class="btn btn--danger" id="cancel-edit">Cancel</button>
        </form>
      `;

      document.getElementById('save-review').addEventListener('click', async e => {
        e.preventDefault();
        const updatedText = document.getElementById('edit-review-text').value;
        const updatedRating = document.getElementById('edit-review-rating').value;

        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/reviews/${reviewId}`,
            data: { 
              review: updatedText,
              rating: updatedRating
            }
          });

          if (res.data.status === 'success'){
            showAlert('success', 'Review Updated Successfully.')
            location.reload();
          }
        } catch (err) {
          console.error('Error: ', err.response || err);
          showAlert('error', 'Failed to update review');
        }
      });

      document.getElementById('cancel-edit').addEventListener('click', e => {
        e.preventDefault();
        location.reload();
      });
    });

  });
});

const alertMessage = document.querySelector('body').dataset.alert;
if(alertMessage)
  showAlert('success', alertMessage, 20);
