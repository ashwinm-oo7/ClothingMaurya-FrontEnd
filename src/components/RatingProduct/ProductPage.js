import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AverageStarRating from "./AverageStarRating";

const ProductPage = ({ productId, disabled }) => {
  const [productRatings, setProductRatings] = useState([]);

  useEffect(() => {
    fetchProductRatings(productId);
  }, [productId]);

  const fetchProductRatings = async (productId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}review/getProductAverageRatings`,
        {
          params: { productId },
        }
      );
      if (response.status === 200) {
        setProductRatings(response.data);
      }
      // console.log(
      //   "fetchProductRatings",
      //   response.data,
      //   productRatings[productId]
      // );
    } catch (error) {
      toast.error("Failed to fetch product average ratings.");
    }
  };
  return (
    <div>
      <AverageStarRating
        productRatings={productRatings}
        rating={productRatings[productId]}
        productId={productId}
        fetchProductRatings={fetchProductRatings}
        disabled={disabled}
      />
    </div>
  );
};

export default ProductPage;
