import axios from "axios";
import { showAlert } from "./alerts";

export const createReview = async (review, rating, tourId) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/reviews',
            data: {
                review,
                rating,
                tour: tourId
            }
        })
        if (res.data.status === 'success'){
            showAlert('success', 'Review Added Successfully');
            window.setTimeout(() => {
                location.reload();
            }, 1500);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
}

export const deleteReview = async(reviewId) => {
    try{
        const res = await axios({
            method: 'DELETE',
            url: `/api/v1/reviews/${reviewId}`,
        })

        if(res.status === 204){
            showAlert('success', 'Review Deleted Successfully.');
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
    } catch(err){
        showAlert('error', err.response.data.message);
    }
}