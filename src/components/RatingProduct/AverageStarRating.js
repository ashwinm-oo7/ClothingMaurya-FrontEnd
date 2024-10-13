import React, { useState, useRef, useEffect } from "react";
import StarRating from "./StarRating";
import "./css/AverageStarRating.css";
import axios from "axios";
import { FaTimes } from "react-icons/fa";

const AverageStarRating = ({
  productRatings,
  rating,
  productId,
  fetchProductRatings,
  disabled,
}) => {
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const popupRef = useRef(null); // Reference for the popup
  const [reviews, setReviews] = useState([]);

  const numberOfStars = 5;
  const roundedRating = rating ? Math.round(rating * 2) / 2 : 0;
  // Close the popup when clicking outside
  const productReviews = reviews.filter(
    (review) => review.productId === (productId ? productId : "")
  );

  useEffect(() => {
    fetchAllReviews();
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowReviewPopup(false);
      }
    };
    if (showReviewPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReviewPopup]);

  const handleClick = () => {
    setShowReviewPopup(!showReviewPopup);
  };
  const handleClosePopup = (e) => {
    e.stopPropagation();
    setShowReviewPopup(false);
  };
  const fetchAllReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}review/getAllReviews`
      );
      if (response.status === 200) {
        setReviews(response.data);
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
    }
  };
  return (
    <div
      className="star-rating"
      onClick={!disabled ? handleClick : undefined}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {[...Array(numberOfStars)].map((_, index) => {
        const starIndex = index + 1;
        let starClass = "star-off";
        if (rating !== null) {
          if (starIndex <= Math.floor(roundedRating)) {
            starClass = "star-on";
          } else if (starIndex - 0.5 === roundedRating) {
            starClass = "star-partial";
          }
        }

        return (
          <span key={index} className={`star ${starClass}`}>
            <span
              style={{ cursor: disabled ? "" : "pointer" }}
              className="star-background"
            >
              &#9733;
            </span>
          </span>
        );
      })}
      {!disabled && productReviews.length > 0 && (
        <span style={{ marginLeft: "10px", color: "#666565" }}>
          {productReviews.length} ratings
        </span>
      )}
      {showReviewPopup && (
        <div
          className="popupReviews"
          ref={popupRef} // Reference for the popup
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="popup-title"
          aria-describedby="popup-description"
        >
          <FaTimes
            onClick={handleClosePopup}
            style={{ cursor: "pointer" }}
            title="Close"
          />
          <div className="review-content">
            <StarRating
              productRating={productId}
              fetchProductRatings={fetchProductRatings}
              productRatings={productRatings}
              setShowReviewPopup={setShowReviewPopup}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AverageStarRating;
