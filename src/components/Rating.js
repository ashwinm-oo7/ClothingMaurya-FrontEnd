// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const Rating = ({ productId, userEmail, onRatingSubmit }) => {
//   const [currentRating, setCurrentRating] = useState(null);

//   useEffect(() => {
//     // Fetch the existing rating when the component mounts
//     const fetchExistingRating = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}product/getReviews`,
//           {
//             params: {
//               productId: productId,
//               userEmail: userEmail,
//             },
//           }
//         );
//         const existingReview = response.data;
//         if (existingReview && existingReview.length > 0) {
//           setCurrentRating(existingReview[0].rating);
//         }
//       } catch (error) {
//         console.error("Error fetching existing rating:", error);
//       }
//     };

//     fetchExistingRating();
//   }, [productId, userEmail]);

//   const handleRatingSelect = async (rating) => {
//     if (currentRating === rating) {
//       toast.warning("You cannot submit the same rating again.");
//       return;
//     }

//     try {
//       if (currentRating !== null) {
//         await axios.put(
//           `${process.env.REACT_APP_API_URL}product/updateReviews`,
//           {
//             productId: productId,
//             userEmail: userEmail,
//             rating: rating,
//           }
//         );
//         toast.success("Rating updated successfully!");
//       } else {
//         await axios.post(`${process.env.REACT_APP_API_URL}product/reviews`, {
//           productId: productId,
//           userEmail: userEmail,
//           rating: rating,
//         });
//         toast.success("Rating submitted successfully!");
//       }

//       setCurrentRating(rating);
//       onRatingSubmit(productId, rating); // Notify parent component of the rating submission
//     } catch (error) {
//       console.error("Error submitting rating:", error);
//       toast.error("Failed to submit rating. Please try again.");
//     }
//   };

//   return (
//     <div className="product-rating">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <i
//           key={star}
//           className={`fa fa-star${star <= currentRating ? "" : "-o"} yellow`}
//           onClick={() => handleRatingSelect(star)}
//           style={{ cursor: "pointer" }}
//         />
//       ))}
//     </div>
//   );
// };

// export default Rating;
