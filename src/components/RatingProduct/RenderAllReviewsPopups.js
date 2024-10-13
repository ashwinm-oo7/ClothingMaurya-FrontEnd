import React from "react";
import AverageStarRating from "./AverageStarRating";

const RenderAllReviewsPopups = ({
  reviews,
  selectedProduct,
  productRatings,
}) => {
  const productReviews = reviews.filter(
    (review) => review.productId === (selectedProduct ? selectedProduct : "")
  );
  console.log(productReviews);
  const calculateRatingPercentages = (reviews) => {
    const totalReviews = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
      ratingCounts[review.rating]++;
    });

    return {
      5: ((ratingCounts[5] / totalReviews) * 100).toFixed(0),
      4: ((ratingCounts[4] / totalReviews) * 100).toFixed(0),
      3: ((ratingCounts[3] / totalReviews) * 100).toFixed(0),
      2: ((ratingCounts[2] / totalReviews) * 100).toFixed(0),
      1: ((ratingCounts[1] / totalReviews) * 100).toFixed(0),
    };
  };

  const ratingPercentages = calculateRatingPercentages(productReviews);

  const maskEmail = (email) => {
    const firstPart = email.substring(0, 5);
    const lastPart = email.slice(-3);
    const middleLength = email.length - (firstPart.length + lastPart.length);
    return `${firstPart}${"*".repeat(middleLength)}${lastPart}`;
  };
  const renderRatingBreakdown = (ratingPercentages) => (
    <div className="rating-breakdown">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div key={rating} className="rating-bar">
          <span>{rating} star</span>
          <div className="bar-container">
            <div
              className="filled-bar"
              style={{
                width: `${ratingPercentages[rating]}%`,
                backgroundColor: "#f0c14b",
                height: "100%",
              }}
            />
          </div>
          <span>{ratingPercentages[rating]}%</span>
        </div>
      ))}
    </div>
  );
  const emptyStar = "☆"; // Unicode for empty star
  const fullStar = "★"; // Unicode for full star

  return (
    <div className="review-popups">
      <h3 className="h1">Customer Reviews</h3>
      {productReviews.length > 0 && (
        <>
          <div>
            <span
              style={{
                display: "inline-flex",
                // alignItems: "center",
                userSelect: "none",
              }}
            >
              <AverageStarRating
                rating={
                  productRatings[selectedProduct ? selectedProduct : ""] || 0
                }
                disabled={true}
              />
            </span>
            <span style={{ marginLeft: "5px" }}>
              {productRatings[selectedProduct ? selectedProduct : ""] ||
                "No rating yet"}{" "}
              out of 5<div></div>
            </span>
            <span>{productReviews.length} global ratings</span>
          </div>
          {renderRatingBreakdown(ratingPercentages)}
          {productReviews.map((review, index) => (
            <div key={index}>
              <strong>{maskEmail(review.userEmail)}</strong>
              <div>
                <span>
                  {[...Array(5)].map((_, index) => {
                    index += 1; // Start at 1 instead of 0
                    return (
                      <span
                        key={index}
                        style={{
                          color: index <= review.rating ? "gold" : "grey",
                        }}
                      >
                        {index <= review.rating ? fullStar : emptyStar}
                      </span>
                    );
                  })}
                </span>
                <span> on {review.createdAt?.split(",")[0]}</span>
              </div>
              {review.comment && <p>{review.comment}</p>}
              <hr />
            </div>
          ))}
        </>
      )}
      {productReviews.length === 0 && (
        <p>No reviews available for this product.</p>
      )}
    </div>
  );
};

export default RenderAllReviewsPopups;
