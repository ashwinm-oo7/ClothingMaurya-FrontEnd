import React from "react";
import { FaMinus } from "react-icons/fa";
import axios from "axios";
import "../css/home.css";
import MainPopup from "./MainPopup";
import Header from "./Header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default class ReviewPopUp extends React.Component {
  constructor(props) {
    super(props);
    this.imgRef = React.createRef();
    this.resultRef = React.createRef();

    this.state = {
      isLoggedIn: false,
      products: [],
      productRatings: [],
      carBrands: [],
      bikeBrands: [],
      cart: [],
      selectedProduct: null,
      showShareOptions: null,
      averageRating: null,
      selectedProductReviews: null,
      lastSubmittedRating: null,
      searchData: [],
      searchQuery: "",
      searchHistory: [],
      isInputFocused: false,
      searchResults: [],
      isFormVisible: false,
      feedback: "",
      filteredProducts: [],
      showOne: true,
      hoveredImageIndex: -1,
      cx: 0,
      cy: 0,
      showMoreInfo: false,
      isHovered: false,
      selectedColors: {},
      selectedImageIndex: 0,
      rating: 0,
      reviews: [],
      loading: true,
      error: null,
      hover: 0,
      hoveredProductId: null,
      hoveredRatingIndex: null,
      userEmail: localStorage.getItem("userEmail") || "",
      showReviewPopup: false,
      selectedProductReviewss: [],
      selectedProductAverageRating: 0,

      selectedSizes: JSON.parse(localStorage.getItem("selectedSizes")) || {}, // Initialize with saved data from local storage
    };
  }

  handleMouseEnter = (productId, index) => {
    this.setState({
      hoveredProductId: productId,
      hoveredRatingIndex: index,
    });
  };

  renderStarRating = (productRating) => {
    const {
      rating,
      hover,
      //   reviews,
      userEmail,
      hoveredProductId,
      hoveredRatingIndex,
    } = this.state;
    const { reviews } = this.props;
    const userReview = reviews.find(
      (review) =>
        review.productId === productRating && review.userEmail === userEmail
    );
    const userRating = userReview ? userReview.rating : 0;
    const isHovered = hoveredProductId === productRating;
    console.log("RenderRating reviews", reviews);

    return (
      <div className="star-rating ">
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <span
              type="button"
              key={index}
              // className={
              //   index <= (isHovered ? hoveredRatingIndex : userRating)
              //     ? "on"
              //     : "off"
              // }
              className={
                index <= userRating ? "on" : "off" // Only apply the "on" class if the rating is selected
              }
              onClick={() => this.handleRatingSelect(index, productRating)}
              onMouseEnter={() => this.handleMouseEnter(productRating, index)}
              onMouseLeave={() => this.setState({ hover: userRating })}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
              }}
            >
              <span className="star">&#9733;</span>
            </span>
          );
        })}
      </div>
    );
  };
  handleRatingSelect = async (index, productRating) => {
    const { userEmail } = this.state;
    const { reviews } = this.props;
    if (!userEmail) {
      toast.warning("Please log in to submit a rating.");
      window.location.href = "/login"; // Or use useHistory or useNavigate if using React Router
      return;
    }

    if (productRating) {
      console.log("Review productID", productRating);

      try {
        const existingReviewResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}product/getReviews`,
          {
            params: {
              productId: productRating,
              userEmail: userEmail,
            },
          }
        );

        const existingReview = existingReviewResponse.data;
        console.log(" existingReview ", existingReview);
        if (existingReview && existingReview.length > 0) {
          const currentRating = existingReview[0].rating;

          if (currentRating === index) {
            toast.warning("You cannot submit the same rating again.");
            return;
          }
          await axios.put(
            `${process.env.REACT_APP_API_URL}product/updateReviews`,
            {
              productId: productRating,
              userEmail: userEmail,
              rating: index,
            }
          );
          toast.success("Rating updated successfully!");
          const updatedReviews = reviews.map((review) =>
            review.productId === productRating && review.userEmail === userEmail
              ? { ...review, rating: index }
              : review
          );
          this.setState({ reviews: updatedReviews });
        } else {
          await axios.post(`${process.env.REACT_APP_API_URL}product/reviews`, {
            productId: productRating,
            userEmail: userEmail,
            rating: index,
          });
          toast.success("Rating submitted successfully!");
          const newReview = {
            productId: productRating,
            userEmail: userEmail,
            rating: index,
          };
          this.setState({ reviews: [...reviews, newReview] });
        }

        this.fetchProductReviews(productRating);
        this.fetchProductAverageRatings();
      } catch (error) {
        console.error("Error submitting rating:", error.response || error);
        toast.error("Failed to submit rating. Please try again.");
      }
    } else {
      toast.warning("Please select a product before rating.");
    }
  };
  fetchProductAverageRatings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}product/getProductAverageRatings`
      );
      console.log("getProductAverageRatings", response.data);
      this.setState({
        productRatings: response.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching product average ratings:", error);
      toast.error("Failed to fetch product average ratings. Please try again.");
      this.setState({ loading: false, error: error.message });
    }
  };

  fetchProductReviews = async (productId) => {
    const userEmail = this.state.userEmail;
    console.log("Review productID", productId);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}product/getReviews`,
        {
          params: { productId, userEmail },
        }
      );
      console.log("FetchRating :", response);
      const reviews = response.data;
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length
          : 0;
      this.setState({
        selectedProductReviews: reviews,
        averageRating,
      });
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  };
  fetchAllReviews = async () => {
    const { userEmail } = this.state;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}product/getAllReviews`,
        {
          params: { userEmail },
        }
      );
      console.log("getAllReviews", response.data);
      this.setState({
        reviews: response.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews. Please try again.");
      this.setState({ loading: false, error: error.message });
    }
  };
  handleProductClick = (product) => {
    this.setState({
      selectedProduct: product,
    });
    this.fetchProductReviews(product);
  };

  render() {
    const { reviews, averageRating, onClose, productId } = this.props;
    return (
      <div className="review-popup">
        <button onClick={onClose}>Close</button>
        <h2>Product Reviews</h2>
        <div
          class="product-rating"
          onClick={() => {
            this.handleProductClick(productId);
          }}
        >
          {/* <i class="fa fa-star-o yellow"></i>
                              <i class="fa fa-star-o yellow"></i>
                              <i class="fa fa-star-o yellow"></i>
                              <i class="fa fa-star-o"></i>
                              <i class="fa fa-star-o"></i> */}

          {this.renderStarRating(productId)}
        </div>
        {/* <div>
          <h3>Average Rating: {averageRating} out of 5</h3>
          <div className="rating-distribution">

          </div>
        </div>
        <div className="comments-section">
          <h3>Comments:</h3>
          {reviews.map((review, index) => (
            <div key={index} className="comment">
              <p>{review.comment}</p>
              <span>{review.rating} stars</span>
            </div>
          ))}
        </div> */}
      </div>
    );
  }
}
