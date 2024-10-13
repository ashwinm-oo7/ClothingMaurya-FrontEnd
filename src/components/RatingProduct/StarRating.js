import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import RenderAllReviewsPopups from "./RenderAllReviewsPopups.js";

const StarRating = ({
  productRating,
  fetchProductRatings,
  productRatings,
  setShowReviewPopup,
}) => {
  const [reviews, setReviews] = useState([]);
  const [userRatingss, setUserRating] = useState(0);
  const [userCommentss, setUserComment] = useState("");
  const [submitReviewPopup, setSubmitReviewPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    // fetchProductRatings();
    fetchAllReviews();

    fetchProductReviews(productRating);
    // fetchProducts(); // Add this if you need to fetch products
  }, [productRating]);

  const userReview = reviews?.find(
    (review) =>
      review.productId === productRating && review.userEmail === userEmail
  );
  const userRating = userReview ? userReview.rating : 0;
  const userComment = userReview ? userReview.comment : "";

  const handleRatingSelect = (index, productRatingID) => {
    setUserRating(index);
    let updatedReviews = [...reviews];

    const existingReviewIndex = updatedReviews.findIndex(
      (review) =>
        review.productId === productRatingID && review.userEmail === userEmail
    );

    if (existingReviewIndex !== -1) {
      updatedReviews[existingReviewIndex] = {
        ...updatedReviews[existingReviewIndex],
        rating: index,
      };
      // setExistingReview(updatedReviews[existingReviewIndex]);
    } else {
      updatedReviews.push({
        productId: productRatingID,
        userEmail: userEmail,
        rating: index,
        comment: "", // Start with an empty comment
      });
      // setExistingReview(null);
    }

    setReviews(updatedReviews);
  };

  const handleReviewCommentChange = (e, productRating) => {
    const comment = e.target.value;
    setUserComment(comment);
    const userEmail = localStorage.getItem("userEmail") || "";

    let updatedReviews = [...reviews];

    const existingReviewIndex = updatedReviews.findIndex(
      (review) =>
        review.productId === productRating && review.userEmail === userEmail
    );

    if (existingReviewIndex !== -1) {
      updatedReviews[existingReviewIndex] = {
        ...updatedReviews[existingReviewIndex],
        comment,
      };
      // setExistingReview(updatedReviews[existingReviewIndex]);
    } else {
      updatedReviews.push({
        productId: productRating,
        userEmail: userEmail,
        rating: 0,
        comment: comment,
      });
      // setExistingReview(null);
    }
    setReviews(updatedReviews);
  };

  const fetchAllReviews = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}review/getAllReviews`
      );
      if (response.status === 200) {
        setReviews(response.data);
        // console.log("fetchAllReviews ", response.data);
      } else {
        console.error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          `Failed to fetch reviews: ${
            error.response.data.message || "Server Error"
          }`
        );
      } else if (error.request) {
        console.error("Failed to fetch reviews: No response from server");
      } else {
        console.error(`Failed to fetch reviews: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async (productId) => {
    if (!userEmail) {
      toast.warning("Please log in to submit a review.");
      window.location.href = "/login";
      return;
    }
    try {
      const userReview = reviews.find(
        (review) =>
          review.productId === productId && review.userEmail === userEmail
      );

      if (!userReview || userReview.rating === 0) {
        toast.warning("Please select a rating before submitting.");
        return;
      }
      const reviewData = {
        productId,
        userEmail,
        rating: userReview.rating,
        comment: userReview.comment,
      };

      const existingReviewResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}review/getReviews`,
        { params: { productId, userEmail } }
      );

      const existingReview = existingReviewResponse.data;
      if (existingReview?.length > 0) {
        const currentRating = existingReview[0].rating;
        const currentComment = existingReview[0].comment;

        if (
          currentRating === userReview.rating &&
          currentComment === userReview.comment
        ) {
          toast.warning("You cannot submit the same rating and comment again.");
          return;
        }
        await axios.put(
          `${process.env.REACT_APP_API_URL}review/updateReviews`,
          reviewData
        );
        toast.success("Review updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}review/reviews`,
          reviewData
        );
        toast.success("Review submitted successfully!");
      }
      setReviews([...reviews, userReview]);
      fetchAllReviews();
      fetchProductReviews(productId);
      fetchProductRatings();
      setShowReviewPopup(false);
    } catch (error) {
      console.error("Error submitting review:", error.response || error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}review/getReviews`,
        {
          params: { productId, userEmail },
        }
      );
      if (response.data.length > 0) {
        const { rating, comment } = response.data[0];
        setUserRating(rating);
        setUserComment(comment);
        // setReviews(response.data);
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  };

  const isSubmitButtonDisabled =
    userRatingss === 0 && userCommentss.trim() === "";
  return (
    <div className="star-rating">
      {submitReviewPopup && (
        <div>
          {[...Array(5)].map((_, index) => {
            index += 1;
            return (
              <span
                type="button"
                key={index}
                className={
                  index <= userRating
                    ? userRating
                      ? "on"
                      : "off"
                    : index <= userRatingss
                    ? "on"
                    : "off"
                }
                onClick={() => handleRatingSelect(index, productRating)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "24px",
                }}
              >
                <span
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  className="star"
                >
                  &#9733;
                </span>
              </span>
            );
          })}
          <>
            <textarea
              placeholder="Write your review here..."
              onChange={(e) => handleReviewCommentChange(e, productRating)}
              value={userComment ? userComment : userCommentss}
              rows="3"
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "5px",
                fontSize: "16px",
              }}
            />
            <button
              onClick={() => submitReview(productRating)}
              disabled={isSubmitButtonDisabled}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Submit Review
            </button>
          </>
        </div>
      )}

      <div>
        <h3
          className="review-toggle"
          onClick={() => {
            setSubmitReviewPopup(!submitReviewPopup);
          }}
          style={{
            backgroundColor: !submitReviewPopup ? "#f2f2f1" : "",
            padding: "8px 16px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {!submitReviewPopup ? "Write Reviews" : "See Customer Reviews"}
        </h3>
      </div>
      {!submitReviewPopup && (
        <>
          <RenderAllReviewsPopups
            reviews={reviews}
            selectedProduct={productRating}
            productRatings={productRatings}
          />
        </>
      )}
    </div>
  );
};

export default StarRating;
