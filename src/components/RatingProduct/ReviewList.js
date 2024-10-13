import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom"; // To access query params
import "./css/ReviewList.css"; // Optional for styling
import Pagination from "../Pagination/Pagination";
import {
  handleSearchKeyPress,
  handleUnapprovedReviews,
  toggleApproval,
} from "../VariantReusable";
const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin] = useState(localStorage.getItem("isAdmin"));
  const [unapprovedCount, setUnapprovedCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [filteredPaymentInfo, setFilteredPaymentInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const query = new URLSearchParams(useLocation().search);
  const productId = query.get("productId");

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}review/getAllReviews`,
        {
          params: { isAdmin },
        }
      );
      if (response.status === 200) {
        const fetchedReviews = response.data.reverse();
        setReviews(fetchedReviews);
        handleUnapprovedReviews(fetchedReviews, productId, setUnapprovedCount);
      } else {
        toast.error("Failed to fetch reviews.");
      }
    } catch (error) {
      toast.error("Failed to fetch reviews.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value.toLowerCase());
    if (searchInput === "") {
      setFilteredPaymentInfo(filteredReviews);
      setCurrentPage(1);
    }
  };

  const filteredReviews = useMemo(
    () =>
      productId
        ? reviews.filter((review) => review.productId === productId)
        : reviews,
    [productId, reviews]
  );

  useEffect(() => {
    // Set filtered reviews to default on component mount or data update
    setFilteredPaymentInfo(filteredReviews);
  }, [reviews, filteredReviews]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const currentItems = filteredPaymentInfo.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  return (
    <div className="review-list">
      {isLoading ? (
        <div className="skeleton-loader">
          <div className="skeleton-heading"></div>
          <div className="skeleton-table">
            {/* Simulating multiple rows of the table */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="skeleton-row">
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
                <div className="skeleton-cell"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div>
          {productId ? (
            <h2 className="filter">
              Newest Reviews for Product ${productId}00{" "}
              <input
                style={{ borderRadius: "30px", maxWidth: "600px" }}
                type="text"
                placeholder="Search by E-mail  then press enter"
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={(e) =>
                  handleSearchKeyPress(
                    e,
                    filteredReviews,
                    searchInput,
                    setFilteredPaymentInfo,
                    setCurrentPage
                  )
                }
              />
            </h2>
          ) : (
            <h2 className="filter">
              Newest of All Reviews{" "}
              <input
                style={{ borderRadius: "30px", maxWidth: "600px" }}
                type="text"
                placeholder="Search by E-mail  then press enter"
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={(e) =>
                  handleSearchKeyPress(
                    e,
                    filteredReviews,
                    searchInput,
                    setFilteredPaymentInfo,
                    setCurrentPage
                  )
                }
              />
            </h2>
          )}
          <table>
            <thead>
              <tr>
                <th>SrNO</th>
                <th>User Email</th>
                <th>Date</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((review, index) => (
                <tr
                  key={review._id}
                  className={!review.isApproved ? "highlight" : ""}
                >
                  <td style={{ width: "50px" }}>
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </td>
                  <td>{review.userEmail}</td>
                  <td>{review.createdAt}</td>
                  <td>{review.rating} ★</td>
                  <td className="comment-cell">{review.comment}</td>
                  <td>{review.isApproved ? "True" : "False"}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={!!review.isApproved}
                        onChange={() =>
                          toggleApproval(
                            review._id,
                            review.isApproved,
                            reviews,
                            setReviews,
                            fetchReviews
                          )
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            filteredPaymentInfo={filteredReviews}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      ) : (
        <h2>
          {productId
            ? "No reviews found for this product."
            : "No reviews found."}
        </h2>
      )}
    </div>
  );
};

export default ReviewList;
