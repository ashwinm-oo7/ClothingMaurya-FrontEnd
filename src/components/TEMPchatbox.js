import React, { Component } from "react";
import { FaMinus, FaBan } from "react-icons/fa";
import axios from "axios";
import "../css/home.css";
// import MainPopup from "./MainPopup";
import Header from "./Header";
// import { renderProductList } from "../components/ProductReusable/renderProductList";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductPage from "./RatingProduct/ProductPage";
import LZString from "lz-string";

import {
  filterLatestProducts,
  handleVariantAddToCart,
  handleRemoveFromCart2Variant,
  fetchAllCart,
  renderShareOptions,
  renderColorOptions,
} from "./cartFunctions";
import logo from "../icons/maurya.png";
import ChatBox from "./ChatBox";
import { Link } from "react-router-dom";
// import Product from "./Product.js";
import {
  // handleImageHover,
  // handleSizeChange,
  getVariantDetails,
  calculateDiscountPercentage,
  // useProductVariantDetails,
  getSizeOptions,
  getProductVariantDetails,
} from "./VariantReusable.js";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.imgRef = React.createRef();
    this.resultRef = React.createRef();

    this.state = {
      isLoggedIn: false,
      products: [],
      filteredProductInfo: [],
      productRatings: [],
      carBrands: [],
      bikeBrands: [],
      cart: [],
      selectedProduct: null,
      selectedProductReviews: null,
      selectedProductRating: null,
      showShareOptions: null,
      averageRating: null,
      lastSubmittedRating: null,
      searchData: [],
      searchQuery: "",
      isInputFocused: false,
      searchResults: [],
      searchResultsShow: false,
      isFormVisible: false,
      feedback: "",
      filteredProducts: [],
      showOne: true,
      hoveredImageIndex: -1,
      writeReviews: true,
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
      showAllReviewsPopup: false,
      searchInput: "",
      _isMounted: false,
      selectedSizeVariants: "",
      selectedColor: "",
      variantPrice: 0,
      variantMrpPrice: 0,
      cartVariantQuantity: 0,
      selectedOptions: {},
      isProcessing: false,
    };

    this.setCart = this.setCart.bind(this);
    this.setSelectedSizes = this.setSelectedSizes.bind(this);
    this.fetchAllProducts = this.fetchAllProducts.bind(this);
    this.setVariantAll = this.setVariantAll.bind(this);
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
  }

  componentDidMount() {
    this.fetchAllProducts();

    this.setVariantAll();
    this._isMounted = true;
    // this.fetchProductAverageRatings();
    this.fetchCartFromLocalStorage();
    fetchAllCart(this.setCart, this.setSelectedSizes);
    const userId = localStorage.getItem("userId");
    this.setState({ userId });
    if (!userId) {
      try {
        const storedCart = JSON.parse(localStorage.getItem("carts")) || [];
        this.setState({ cart: storedCart });
      } catch (error) {
        console.error(
          "Invalid cart data in localStorage, clearing data.",
          error
        );
        localStorage.removeItem("cart");
        this.setState({ cart: [] });
      }
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.cart !== this.state.cart && !localStorage.getItem("userId")) {
      const compressedCart = LZString.compress(JSON.stringify(this.state.cart));
      localStorage.setItem("cart", compressedCart);
    }
    const { selectedColor, selectedSizeVariants } = this.state;

    if (
      prevState.selectedColor !== selectedColor ||
      prevState.selectedSizeVariants !== selectedSizeVariants
    ) {
      // Assuming that product information is also part of the state
      const selectedProduct = this.state.selectedProduct;

      if (selectedProduct) {
        this.updateVariantDetails(selectedProduct);
      }
    }
  }

  fetchAllProducts = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "product/getAllProducts"
      );
      if (response.status !== 200) {
        toast.error(
          `Failed to fetch products. Server responded with status ${response.status}.`
        );
        console.error(`Error: Server responded with status ${response.status}`);
        return;
      }

      const updatedProducts = response.data;
      if (updatedProducts.length === 0) {
        toast.info("No products found.");
        console.warn("No products returned from the API.");
      }

      // const reversedProducts = [...updatedProducts].reverse();

      // this.setState({
      //   products: reversedProducts,
      //   filteredProductInfo: reversedProducts,
      //   loading: false,
      // });

      this.setState((prevState) => ({
        products: [...prevState.products, ...response.data.reverse()],
        filteredProductInfo: [
          ...prevState.products,
          ...response.data.reverse(),
        ],
        loading: false,
      }));
      console.log("All Products:", updatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Server-side error. Please try again later.");
    }
  };

  setVariantAll = async () => {
    const { products } = this.state;

    if (products && products.length > 0) {
      // Iterate over all products and set default color and size for each
      const updatedOptions = {};

      products.forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          const defaultColor = product.variants[0].color;
          const defaultSize =
            product.variants[0].sizes && product.variants[0].sizes.length > 0
              ? product.variants[0].sizes[0].size
              : "";

          updatedOptions[product._id] = {
            color: defaultColor,
            size: defaultSize,
            variantPrice: product.variants[0].sizes[0].price,
            variantMrpPrice: product.variants[0].sizes[0].mrpPrice,
            cartVariantQuantity: product.variants[0].sizes[0].quantity || "",
          };
        }
      });

      this.setState({
        selectedOptions: updatedOptions,
      });
    }
  };

  setCart(newCart) {
    this.setState({ cart: newCart });
  }
  setSelectedSizes(newSelectedSizes) {
    this.setState({ selectedSizeVariants: newSelectedSizes });
  }
  updateVariantDetails = (product) => {
    const selectedOptions = this.state.selectedOptions[product._id] || {};
    const selectedColor = selectedOptions.color || "";
    const selectedSizeVariants = selectedOptions.size || "";

    const { variantPrice, variantMrpPrice, cartVariantQuantity } =
      getProductVariantDetails(product, selectedColor, selectedSizeVariants);

    this.setState((prevState) => ({
      selectedOptions: {
        ...prevState.selectedOptions,
        [product._id]: {
          ...prevState.selectedOptions[product._id],
          variantPrice,
          variantMrpPrice,
          cartVariantQuantity,
        },
      },
    }));
  };

  handleColorChange = (productId, color) => {
    this.setState(
      (prevState) => ({
        selectedOptions: {
          ...prevState.selectedOptions,
          [productId]: {
            ...prevState.selectedOptions[productId],
            color: color,
          },
        },
      }),
      () => {
        // Fetch size options after color is selected
        const selectedSizeVariants =
          getSizeOptions(this.findProductById(productId).variants, color)[0]
            ?.size || "";
        this.handleSizeChange(productId, selectedSizeVariants);
      }
    );
  };

  handleSizeChange = (productId, size) => {
    this.setState(
      (prevState) => ({
        selectedOptions: {
          ...prevState.selectedOptions,
          [productId]: {
            ...prevState.selectedOptions[productId],
            size: size,
          },
        },
      }),
      () => {
        // After selecting size, update variant details
        const product = this.findProductById(productId);
        this.updateVariantDetails(product);
      }
    );
  };
  findProductById = (productId) => {
    return this.state.products.find((product) => product._id === productId);
  };

  handleProductClick = (product) => {
    this.setState({
      selectedProduct: product,
    });
    // this.fetchProductReviews(product._id);
  };

  findCartItem = (productId) => {
    return this.state.cart.find((item) => item._id === productId);
  };

  handleImageSelect = (index) => {
    this.setState({ selectedImageIndex: index });
  };

  handleColorSelect = (productId, color) => {
    this.setState((prevState) => ({
      selectedColors: {
        ...prevState.selectedColors,
        [productId]: color,
      },
    }));
  };

  toggleMoreInfo = () => {
    this.setState((prevState) => ({
      showMoreInfo: !prevState.showMoreInfo,
    }));
  };
  handleHover = (isHovered) => {
    this.setState({ isHovered });
  };

  handleImageLoad = () => {
    try {
      const imgRefCurrent = this.imgRef.current;
      const resultRefCurrent = this.resultRef.current;

      if (!imgRefCurrent || !resultRefCurrent) {
        console.error("Image or result reference is null");
        return;
      }

      const lens = document.createElement("div");
      lens.setAttribute("class", "img-zoom-lens");
      imgRefCurrent.parentElement?.insertBefore(lens, imgRefCurrent);

      const cx = resultRefCurrent.offsetWidth / lens.offsetWidth;
      const cy = resultRefCurrent.offsetHeight / lens.offsetHeight;

      this.setState({ cx, cy });

      resultRefCurrent.style.backgroundImage = `url('${imgRefCurrent.src}')`;
      resultRefCurrent.style.backgroundSize = `${imgRefCurrent.width * cx}px ${
        imgRefCurrent.height * cy
      }px`;

      lens.addEventListener("mousemove", this.moveLens);
      imgRefCurrent.addEventListener("mousemove", this.moveLens);
      lens.addEventListener("touchmove", this.moveLens);
      imgRefCurrent.addEventListener("touchmove", this.moveLens);
    } catch (error) {
      console.error("Error in handleImageLoads:", error);
    }
  };

  moveLens = (e) => {
    try {
      e.preventDefault();
      const pos = this.getCursorPos(e);
      let x = pos.x - this.imgRef.current.offsetWidth / 2;
      let y = pos.y - this.imgRef.current.offsetHeight / 2;

      if (x > this.imgRef.current.width - 40)
        x = this.imgRef.current.width - 40;
      if (x < 0) x = 0;
      if (y > this.imgRef.current.height - 40)
        y = this.imgRef.current.height - 40;
      if (y < 0) y = 0;

      const lens = document.querySelector(".img-zoom-lens");
      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;
      this.resultRef.current.style.backgroundPosition = `-${
        x * this.state.cx
      }px -${y * this.state.cy}px`;
    } catch (error) {
      console.error("Error in moveLens:", error);
    }
  };

  getCursorPos = (e) => {
    try {
      let x = 0,
        y = 0;
      const imgRect = this.imgRef.current.getBoundingClientRect();
      x = e.pageX - imgRect.left - window.pageXOffset;
      y = e.pageY - imgRect.top - window.pageYOffset;
      return { x, y };
    } catch (error) {
      console.error("Error in getCursorPos:", error);
      return { x: 0, y: 0 };
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem("userEmail");
      // const isAdmin = localStorage.getItem("isAdmin") === "true";
      if (!userEmail) {
        toast.info("Please login for submitting feedback");
        return;
      }
      const feedbackData = {
        feedback: this.state.feedback,
      };
      if (userEmail) {
        feedbackData.userEmail = userEmail;
      }

      const response = await axios.post(
        process.env.REACT_APP_API_URL + "feedback/addFeedback",
        feedbackData
      );
      console.log("Feedback submitted:", response.zz);
      this.setState({ isFormVisible: false });
    } catch (error) {
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request data:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  handleChange = (e) => {
    this.setState({ feedback: e.target.value });
  };

  logout() {
    localStorage.clear();
    window.location = process.env.REACT_APP_API_URL_FOR_GUI + "/login";
    // window.location = "https://ashwinm-oo7.github.io/login";
  }

  getProductDefaultSize = (productId) => {
    const product = this.state.products.find((p) => p._id === productId);
    return product ? product.defaultSize : "";
  };

  handleAddToCartLocalStorage = (cart, product, quantity) => {
    const index = cart.findIndex((item) => item._id === product._id);
    const availableQuantity = product.productQuantity;
    const existingCartItem = cart.find((item) => item._id === product._id);
    const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;

    if (currentQuantity + quantity > availableQuantity) {
      alert("Cannot add more items than available in stock.");
      return null;
    }

    if (index !== -1) {
      const updatedCart = [...cart];
      updatedCart[index].quantity += quantity;
      updatedCart[index].amount =
        updatedCart[index].quantity * updatedCart[index].productPrice;
      return updatedCart;
    } else {
      const newProduct = {
        ...product,
        quantity: quantity,
        amount: quantity * product.productPrice,
      };
      return [...cart, newProduct];
    }
  };

  isProductInCart = (product) => {
    const { cart } = this.state;
    return cart.some((item) => item._id === product._id);
  };

  getProductQuantity = (product, selectedColor, selectedSize) => {
    const { cart } = this.state;
    const cartItem = cart.find(
      (item) =>
        item._id === product._id &&
        item.selectedColor === selectedColor &&
        item.selectedSizes === selectedSize
    );
    return cartItem ? cartItem.variantQuantity : "";
  };

  handleRemoveFromCart(index) {
    const updatedCart = [...this.state.cart];
    updatedCart.splice(index, 1);
    this.setState({ cart: updatedCart }, () => {
      this.saveCartToLocalStorage(updatedCart);
    });
  }

  calculateTotal() {
    let total = 0;
    this.state.cart.forEach((item) => {
      const price = parseFloat(item.productPrice);
      const quantity = parseInt(item.quantity);
      if (!isNaN(price) && !isNaN(quantity)) {
        total += price * quantity;
      }
    });
    const shippingCost = 0;
    total += shippingCost;
    return total;
  }

  fetchCartFromLocalStorage() {
    const cart = localStorage.getItem("carts");
    if (cart) {
      this.setState((prevState) => ({
        cart: JSON.parse(cart),
      }));
    }
  }

  saveCartToLocalStorage(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  fetchProductDetails = (selectedProduct) => {
    console.log("Selected Product:", selectedProduct);
    this.setState({ selectedProduct });
  };

  toggleFormVisibility = () => {
    this.setState({ isFormVisible: !this.state.isFormVisible });
  };
  handleRefreshPage = () => {
    window.location.reload();
  };
  handleSearchInputChange = (e) => {
    const searchInput = e.target.value.toLowerCase();

    if (searchInput === "") {
      // If the input box is empty, reset to show all payment data
      this.setState({
        searchInput: "",
        filteredProductInfo: this.state.filteredProductInfo,
        // currentPage: 1,
      });
    } else {
      // If there is input, update the searchInput state
      this.setState({ searchInput });
    }
  };

  handleSearchKeyPress = (e) => {
    if (this.state.searchInput) {
      if (e.key === "Enter") {
        const searchInput = this.state.searchInput.toLowerCase().trim();
        const searchFields = [
          "_id",
          "categoryName",
          "subCategoryName",
          "brandName",
          "productName",
          "productQuantity",
          "productPrice",
          "productMrpPrice",
          "manufacturer",
        ];

        const filteredProductInfo = this.state.products.filter((prod) => {
          // Check if the search term is "latest"

          const matchesSimpleFields = searchFields.some((field) => {
            const fieldValue = prod[field];

            if (typeof fieldValue === "number") {
              return fieldValue.toString().includes(searchInput);
            } else if (typeof fieldValue === "string") {
              return fieldValue.toLowerCase().includes(searchInput);
            }
            return false;
          });
          const matchesProductImages = prod.productImages.some((image) => {
            if (image.color && typeof image.color === "string") {
              return image.color.toLowerCase().includes(searchInput);
            }
            return false;
          });
          if (searchInput === "latest") {
            return filterLatestProducts([prod]).length > 0;
          }
          return matchesSimpleFields || matchesProductImages;
        });

        this.setState({
          filteredProductInfo,
          searchResultsShow: true,
          // currentPage: 1,
        });
      }
    }
  };

  addToCartVariant = async (
    product,
    selectedColor,
    selectedSizeVariants,
    cartVariantQuantity,
    variantPrice,
    variantMrpPrice
  ) => {
    const selectedVariant = getVariantDetails(
      product.variants,
      selectedColor,
      selectedSizeVariants
    );
    console.log("selectedSizeVariants", selectedVariant);
    if (!selectedVariant.size) {
      alert("Please select a valid size and color");
      return;
    }

    this.setState({ isProcessing: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    handleVariantAddToCart(
      product,
      this.state.cart,
      this.setCart,
      selectedSizeVariants,
      this.setSelectedSizes,
      selectedColor,
      cartVariantQuantity,
      variantPrice,
      variantMrpPrice
    );
    this.setState({ isProcessing: false });
  };

  renderProductList(categoryName, products) {
    return (
      <div className="row">
        {products
          .filter(
            (prod) => categoryName === "" || prod.categoryName === categoryName
          )
          .map((prod, index) => {
            const cartItem = this.findCartItem(prod._id);
            const isProductInCart = !!cartItem;
            const isCartQuantityMaxed =
              isProductInCart &&
              cartItem.variantQuantity === cartItem.variant.quantity;

            const selectedOptions = this.state.selectedOptions[prod._id] || {};
            const selectedColor =
              selectedOptions.color || prod.variants?.[0].color;

            const selectedSizeVariants =
              selectedOptions.size ||
              getSizeOptions(prod.variants, selectedColor)[0]?.size; // Default to the first size for the selected color

            const variantPrice =
              selectedOptions.variantPrice ||
              prod.variants?.[0].sizes?.[0].price;

            const variantMrpPrice =
              selectedOptions.variantMrpPrice ||
              prod.variants?.[0].sizes?.[0].mrpPrice;

            const cartVariantQuantity =
              selectedOptions.cartVariantQuantity ||
              prod.variants?.[0].sizes?.[0].quantity;
            const variantDiscount = calculateDiscountPercentage(
              variantMrpPrice,
              variantPrice
            );
            const isLimitedTimeDeal = variantDiscount > 75;

            return (
              <div
                className="col-xl-3 col-md-6 col-lg-4 col-sm-6"
                key={prod._id}
              >
                <div className="product-wrap mb-25">
                  <div
                    className="product-img products-img"
                    style={{ userSelect: "none" }}
                    onClick={() => this.handleProductClick(prod)}
                  >
                    <Link to={`/product?id=${prod._id}`} key={index}>
                      {prod.productImages
                        .filter((image) =>
                          this.state.selectedColors[prod._id]
                            ? image.color ===
                              this.state.selectedColors[prod._id]
                            : true
                        )
                        .filter(
                          (image) => !image.dataURL.startsWith("data:video/")
                        )
                        .map((image, imgIndex) => (
                          <img
                            className={
                              imgIndex === 0 ? "default-img" : "hover-img"
                            }
                            src={image.dataURL}
                            alt={`Imagee ${index}-${imgIndex}`}
                            key={imgIndex}
                          />
                        ))}
                    </Link>
                    <span className="red">{variantDiscount}% off</span>

                    {/* Product actions */}
                    <div
                      className="product-action"
                      onClick={() => this.setState({ selectedProduct: prod })}
                    >
                      {/* Wishlist, Cart, Quickview actions */}
                      <div
                        style={{ backgroundColor: "red" }}
                        className="pro-same-action pro-wishlist"
                        onClick={() => this.handleProductClick(prod)}
                      >
                        {renderShareOptions(
                          index,
                          prod,
                          this.state.showShareOptions,
                          this.handleShareButtonClick
                        )}
                      </div>
                      <div
                        className="pro-same-action pro-cart"
                        style={{ backgroundColor: "red" }}
                      >
                        {this.renderCartButton(
                          prod,
                          isCartQuantityMaxed,
                          selectedColor,
                          selectedSizeVariants,
                          cartVariantQuantity,
                          variantPrice,
                          variantMrpPrice
                        )}
                      </div>
                      <div
                        className="pro-same-action pro-quickview"
                        style={{ backgroundColor: "red" }}
                      >
                        <a
                          title="Quick View"
                          href="/#"
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                        >
                          <i className="pe-7s-look"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Product details */}
                  <div className="product-content text-center">
                    <div>
                      <h5>{prod.subCategoryName}</h5>
                    </div>
                    <span className="product-brandName">
                      <a
                        style={{ color: "white" }}
                        href={`/search-results?query=${prod.brandName}`}
                      >
                        {prod.brandName}
                      </a>
                    </span>
                    <div>
                      <h3>
                        <Link to={`/product?id=${prod._id}`} key={index}>
                          {prod.productName}
                        </Link>
                      </h3>
                    </div>
                    <div className="">
                      <span>
                        {/* (
                        {this.state.productRatings[prod._id] || "No rating yet"}{" "}
                        out of 5) */}

                        {/* {this.renderAverageStarRating(
                            this.state.productRatings[prod._id],
                            prod._id
                          )} */}
                        <ProductPage productId={prod._id} />
                      </span>
                      {isLimitedTimeDeal && (
                        <span className="limited-time-offer">
                          Limited Time Deal
                        </span>
                      )}
                    </div>
                    <div
                      className="product-price"
                      onClick={() =>
                        (window.location.href = `/product?id=${prod._id}`)
                      }
                    >
                      <span>₹ {variantPrice}</span>
                      <span className="old">M.R.P: ₹{variantMrpPrice}</span>
                      {/* <span>₹ {prod.productPrice}</span>
                      <span className="old">₹ {prod.productMrpPrice}</span> */}
                    </div>
                    <div>
                      <span>
                        Colour:{" "}
                        <select
                          style={{
                            width: "auto",
                            fontSize: "10px",
                          }}
                          value={selectedColor}
                          onChange={(e) =>
                            this.handleColorChange(prod._id, e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select Color
                          </option>
                          {prod.variants &&
                            prod.variants?.map((variant, index) => (
                              <option key={index} value={variant.color}>
                                {variant.color}
                              </option>
                            ))}
                        </select>
                      </span>
                    </div>
                    <div>
                      Size:{" "}
                      <select
                        value={selectedSizeVariants}
                        onChange={(e) =>
                          this.handleSizeChange(prod._id, e.target.value)
                        }
                        style={{ width: "auto", fontSize: "10px" }}
                      >
                        <option value="">Select Size</option>
                        {getSizeOptions(prod.variants, selectedColor).map(
                          (size, index) => (
                            <option key={index} value={size.size}>
                              {size.size}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    {renderColorOptions(
                      prod,
                      this.state.selectedImageIndex,
                      this.handleColorSelect,
                      this.handleImageSelect
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  renderCartButton(
    prod,
    isCartQuantityMaxed,
    selectedColor,
    selectedSizeVariants,
    cartVariantQuantity,
    variantPrice,
    variantMrpPrice
  ) {
    // const cartItem = this.findCartItem(prod._id);
    const isInCart = this.isProductInCart(prod);
    const quantity = this.getProductQuantity(
      prod,
      selectedColor,
      selectedSizeVariants
    );
    const selectedVariant = getVariantDetails(
      prod.variants,
      selectedColor,
      selectedSizeVariants
    );

    return (
      <>
        {isInCart && quantity > 0 && (
          <FaMinus
            className="quantity-button minus"
            onClick={() =>
              handleRemoveFromCart2Variant(
                prod,
                this.state.cart,
                this.setCart,
                selectedSizeVariants,
                this.setSelectedSizes,
                selectedColor
              )
            }
          />
        )}
        {isInCart && quantity ? (
          <button
            style={{
              backgroundColor: "red",
              fontSize: "14px",
              textAlign: "center",
              lineHeight: "1.8",
            }}
            onClick={() =>
              this.addToCartVariant(
                prod,
                selectedColor,
                selectedSizeVariants,
                cartVariantQuantity,
                variantPrice,
                variantMrpPrice
              )
            }
            title={
              isCartQuantityMaxed
                ? `This seller has only ${cartVariantQuantity} of these available. To see if more are available from another seller, go to the product detail page.`
                : "Add To Cart"
            }
            disabled={cartVariantQuantity <= 0 || isCartQuantityMaxed}
          >
            <i className="pe-7s-cart"></i>
            {isCartQuantityMaxed
              ? `${quantity} Exceed`
              : `${quantity} Added In Cart`}
          </button>
        ) : (
          <button
            style={{
              backgroundColor: "red",
              userSelect: "none",
            }}
            onClick={() =>
              this.addToCartVariant(
                prod,
                selectedColor,
                selectedSizeVariants,
                cartVariantQuantity,
                variantPrice,
                variantMrpPrice
              )
            }
            title={
              selectedVariant.quantity <= 0 ? "Out of Stock" : "Add To Cart"
            }
            disabled={selectedVariant.quantity <= 0}
          >
            {selectedVariant.quantity <= 0 ? (
              <>
                <FaBan style={{ marginRight: "5px" }} />
                Out of Stock
              </>
            ) : (
              <>
                <i className="pe-7s-cart"></i> Add to cart
              </>
            )}
          </button>
        )}
      </>
    );
  }

  handleShareButtonClick(index) {
    this.setState((prevState) => ({
      showShareOptions: prevState.showShareOptions === index ? -1 : index,
    }));
  }

  render() {
    const { cart } = this.state;
    const {
      isFormVisible,
      selectedProduct,
      filteredProductInfo,
      loading,

      // selectedSizeVariants,
      // selectedColor,
      // averageRating,
      // selectedProductReviews,
      // reviews,
      // error,
      // productRatings,
    } = this.state;
    const searchCurrentItems = filteredProductInfo;
    // const userEmail = localStorage.getItem("userEmail");

    return (
      <>
        {loading ? (
          <div className="skeleton-loader">
            <div className="skeleton-heading"></div>
            <div className="skeleton-table">
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
        ) : (
          <div className="" style={{ userSelect: "none" }}>
            {this.state.isProcessing && (
              <div className="overlay">
                <div className="processing-modal">
                  <div className="spinner"></div>
                  <p>
                    <span className="processing">Item adding</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                  </p>
                </div>
              </div>
            )}
            <ChatBox />
            <header
              style={{
                position: "fixed",
                top: 70,
                left: 200,
                right: 0,
                backgroundColor: "transparent", // Optional: to set background color
                // zIndex: 1000,
                padding: "10px 0", // Optional: to add padding if needed
              }}
            ></header>
            {/* <div className="slider-area">
          <div className="slider-active owl-carousel nav-style-1 owl-dot-none">
            <div className="single-slider slider-height-1 bg-purple">
              <div className="container">
                <div className="row">
                  <div className="col-xl-6 col-lg-6 col-md-6 col-12 col-sm-6">
                    <div className="slider-content slider-animated-1">
                      <h3 className="animated"> </h3>
                      <h1 className="animated">
                        Choose Best Clothes Offer <br />
                        2024 Collection
                      </h1>
                      <div className="slider-btn btn-hover">
                        <a className="animated" href="/#">
                          SHOP NOW
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-6 col-12 col-sm-6">
                    <div className="slider-single-img slider-animated-1">
                      <img
                        className="animated"
                        src="https://www.pixelstalk.net/wp-content/uploads/2016/06/Fashion-Wallpaper-HD-Download.jpg"
                        alt=""
                      />
                      <img
                        className="animated"
                        src="https://c1.peakpx.com/wallpaper/573/909/315/store-clothes-clothing-line-fashion-wallpaper.jpg"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="single-slider slider-height-1 bg-purple">
              <div className="container">
                <div className="row">
                  <div className="col-xl-6 col-lg-6 col-md-6 col-12 col-sm-6">
                    <div className="slider-content slider-animated-1">
                      <h3 className="animated"> All Type of Variants</h3>
                      <h1 className="animated">
                        Best Services <br />
                        ALL TIME
                      </h1>
                      <div className="slider-btn btn-hover">
                        <a className="animated" href="/#">
                          SHOP NOW
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-6 col-12 col-sm-6">
                    <div className="slider-single-img slider-animated-1">
                      <img
                        className="animated"
                        src="https://cdn.wallpapersafari.com/53/91/P5gHFU.jpg"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
            <div className="suppoer-area pt-100 pb-60">
              <div className="container">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-6">
                    <div className="support-wrap mb-30 support-1">
                      <div className="support-icon">
                        <img
                          className="animated"
                          src="assets/img/icon-img/support-1.webp"
                          alt=""
                        />
                      </div>
                      <div className="col-xl-8 col-lg-8 d-none d-lg-block">
                        <div
                          className="main-menu"
                          style={{ backgroundColor: "" }}
                        >
                          <nav>
                            <ul>
                              <li>
                                <div className="">
                                  <div className="support-content">
                                    <h5>Free Shipping</h5>
                                  </div>
                                  <p>
                                    Free shipping on all order T&C
                                    <i className="fa fa-angle-down"></i>{" "}
                                  </p>
                                </div>
                                <ul
                                  className="mega-menu"
                                  style={{ width: "600px" }}
                                >
                                  <div className=" " style={{ width: "" }}>
                                    <li>
                                      <ul>
                                        <li className="mega-menu-title">
                                          <strong>
                                            Free Delivery The product is
                                            eligible for Free Delivery on orders
                                            over ₹499{" "}
                                          </strong>
                                        </li>
                                      </ul>
                                    </li>
                                  </div>{" "}
                                  <li>
                                    <ul>
                                      <li className="mega-menu">
                                        <span>
                                          <a href="https://www.amazon.in/gp/help/customer/display.html?nodeId=200534000">
                                            Learn More
                                          </a>
                                        </span>
                                      </li>
                                    </ul>
                                  </li>
                                </ul>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-6">
                    <div className="support-wrap mb-30 support-2">
                      <div className="support-icon">
                        <img
                          className="animated"
                          src="assets/img/icon-img/tyre-repair.jpg"
                          alt=""
                        />
                      </div>
                      <div className="col-xl-8 col-lg-8 d-none d-lg-block">
                        <div
                          className="main-menu"
                          style={{ backgroundColor: "" }}
                        >
                          <nav>
                            <ul>
                              <li>
                                <div className="">
                                  <div className="support-content">
                                    <h5>10 Days</h5>
                                  </div>
                                  <p>
                                    Return & Exchange
                                    <i className="fa fa-angle-down"></i>{" "}
                                  </p>
                                </div>
                                <ul
                                  className="mega-menu"
                                  style={{ width: "600px" }}
                                >
                                  <div className=" " style={{ width: "" }}>
                                    <li>
                                      <ul>
                                        <li className="mega-menu-title">
                                          <table>
                                            <thead>
                                              <tr>
                                                <th>Return Reason</th>
                                                <th>Return Period</th>
                                                <th>Return Policy</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td>Any other reason</td>
                                                <td>10 days from delivery</td>
                                                <td>Full refund</td>
                                              </tr>
                                              <tr>
                                                <td>
                                                  Size too small, Size too large
                                                </td>
                                                <td>10 days from delivery</td>
                                                <td>
                                                  Exchange with a different size
                                                  or colour
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </li>
                                      </ul>
                                    </li>
                                  </div>{" "}
                                  <li>
                                    <ul>
                                      <li className="mega-menu">
                                        <span
                                          onClick={this.toggleMoreInfo}
                                          style={{
                                            cursor: "pointer",
                                            color: "blue",
                                          }}
                                        >
                                          {this.state.showMoreInfo
                                            ? "(Hide)"
                                            : "(Know More)"}
                                        </span>
                                        {this.state.showMoreInfo && (
                                          <div>
                                            <div className="support-icon">
                                              <img
                                                className="animated"
                                                src="assets/img/icon-img/10days.png"
                                                alt=""
                                              />
                                            </div>
                                            <strong>Return Instructions</strong>
                                            <p>
                                              Keep the item in its original
                                              condition and packaging along with
                                              MRP tag and accessories for a
                                              successful pick-up.
                                            </p>
                                          </div>
                                        )}
                                      </li>
                                    </ul>
                                  </li>
                                </ul>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-6">
                    <div className="support-wrap mb-30 support-3">
                      <div className="support-icon">
                        <img
                          className="animated"
                          src="assets/img/icon-img/support-3.webp"
                          alt=""
                        />
                      </div>
                      <div className="col-xl-8 col-lg-8 d-none d-lg-block">
                        <div
                          className="main-menu"
                          style={{ backgroundColor: "" }}
                        >
                          <nav>
                            <ul>
                              <li>
                                <div className="support-content">
                                  <h5>Money Return</h5>
                                  <p>
                                    T & C apply
                                    <i className="fa fa-angle-down"></i>{" "}
                                  </p>
                                </div>
                                <ul
                                  className="mega-menu"
                                  style={{ width: "300px" }}
                                >
                                  <div className=" " style={{ width: "" }}>
                                    <li>
                                      <ul>
                                        <li className="mega-menu-title">
                                          <strong>
                                            What is Money Return ? If the
                                            Product is damage when the delivered
                                            guy just give you only that time
                                            <p>
                                              Delieverd guy take the photo and
                                              complain headoffice then 7 days
                                              working your money will be
                                              Recieved in your account or
                                              wallet!
                                            </p>
                                          </strong>
                                        </li>
                                      </ul>
                                    </li>
                                  </div>{" "}
                                </ul>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-6">
                    <div className="support-wrap mb-30 support-4">
                      <div className="support-icon">
                        <img
                          className="animated"
                          src="assets/img/icon-img/support-4.webp"
                          alt=""
                        />
                      </div>
                      <div className="col-xl-8 col-lg-8 d-none d-lg-block">
                        <div
                          className="main-menu"
                          style={{ backgroundColor: "" }}
                        >
                          <nav>
                            <ul>
                              <li>
                                <div className="support-content">
                                  <h5>Order Discount</h5>
                                  <p>
                                    Best Offer
                                    <i className="fa fa-angle-down"></i>{" "}
                                  </p>
                                </div>
                                <ul
                                  className="mega-menu"
                                  style={{ width: "150px" }}
                                >
                                  <div className=" " style={{ width: "" }}>
                                    <li>
                                      <ul>
                                        <li className="mega-menu-title">
                                          <strong>
                                            Whoose best product and you will get
                                            the best Discount. Why yoy are
                                            waiting shop Now and Enjoy the Offer{" "}
                                          </strong>
                                        </li>
                                      </ul>
                                    </li>
                                  </div>{" "}
                                </ul>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <input
              style={{
                borderRadius: "30px",
                width: "500px",
                marginLeft: "20px",
                backgroundColor: "white",
              }}
              type="text"
              placeholder="Search type then press enter"
              value={this.state.searchInput}
              onChange={this.handleSearchInputChange}
              onKeyPress={this.handleSearchKeyPress}
            />
            <div className="product-area pb-60">
              <div className="container">
                <div className="search">
                  {this.state.searchResultsShow && (
                    <div className="tab-pane" id="product-4">
                      {searchCurrentItems.length > 0 ? (
                        <>
                          <div className="section-title text-center">
                            <h2>Search!!!</h2>
                          </div>
                          {this.state.searchInput && (
                            <div>
                              <h4>
                                Search Result for{" "}
                                <strong style={{ color: "blue" }}>
                                  {this.state.searchInput}
                                </strong>
                              </h4>
                            </div>
                          )}
                        </>
                      ) : (
                        <></>
                      )}
                      {this.renderProductList("", searchCurrentItems)}
                    </div>
                  )}
                </div>

                <div className="section-title text-center">
                  <h2>DAILY OFFERS DEALS!</h2>
                </div>
                <div className="product-tab-list nav pt-30 pb-55 text-center">
                  <a href="#product-1" data-bs-toggle="tab">
                    <h4>Dresses / Bottoms</h4>
                  </a>
                  <a className="active" href="#product-2" data-bs-toggle="tab">
                    <h4>Tops </h4>
                  </a>
                  <a href="#product-3" data-bs-toggle="tab">
                    <h4>Activewear</h4>
                  </a>
                </div>
                <div className="tab-content jump">
                  <div className="tab-pane" id="product-1">
                    {this.renderProductList("Dresses", this.state.products)}
                    {this.renderProductList("Bottoms", this.state.products)}
                  </div>

                  <div className="tab-pane active" id="product-2">
                    {this.renderProductList("Tops", this.state.products)}
                  </div>
                  <div className="tab-pane" id="product-3">
                    {this.renderProductList("Activewear", this.state.products)}
                  </div>
                </div>
              </div>
            </div>
            <div className="blog-area pb-55">
              <div className="container">
                <div className="section-title text-center mb-55">
                  <h2>OUR BLOG</h2>
                </div>
                {this.renderProductList("", this.state.products)}
              </div>
            </div>
            <footer className="footer-area bg-gray pt-100 pb-70">
              <div className="container">
                <div className="row">
                  <div className="col-lg-2 col-md-4 col-sm-4">
                    <div className="copyright mb-30">
                      <div className="footer-logo">
                        <a href="/#">
                          <img
                            alt=""
                            // src="https://i.ibb.co/M23HzTF/9-Qgzvh-Logo-Makr.png"
                            src={logo}
                            style={{ width: "120px", height: "auto" }}
                          />
                        </a>
                      </div>
                      <p>
                        © 2024 <a href="/#">MAURYA</a>.<br /> All Rights
                        Reserved
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-4">
                    <div className="footer-widget mb-30 ml-30">
                      <div className="footer-title">
                        <h3>ABOUT US</h3>
                      </div>
                      <div className="footer-list">
                        <ul>
                          <li>
                            <a href="/about">About us</a>
                          </li>
                          <li>
                            <a href="/">
                              Store location : Jogeshwari Mumbai(102)
                            </a>
                          </li>
                          <li>
                            <a href="/#">
                              Contact : ashwinmaurya9211@gmail.com
                            </a>
                          </li>
                          {/* <li>
                        <a href="/#">Orders tracking</a>
                      </li> */}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-4">
                    <div className="footer-widget mb-30 ml-50">
                      <div className="footer-title">
                        <h3>USEFUL LINKS</h3>
                      </div>
                      <div className="footer-list">
                        <ul>
                          <li>
                            <a href="/#">Returns</a>
                          </li>
                          <li>
                            <a href="/#">Support Policy</a>
                          </li>
                          <li>
                            <a href="/#">Size guide</a>
                          </li>
                          <li>
                            <a href="/#">FAQs</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-6 col-sm-6">
                    <div className="footer-widget mb-30 ml-75">
                      <div className="footer-title">
                        <h3>FOLLOW US</h3>
                      </div>
                      <div className="footer-list">
                        <ul>
                          <li>
                            <a
                              className="fa fa-facebook"
                              href="https://www.facebook.com/ASHMI6oo7/"
                            >
                              &nbsp; Facebook
                            </a>
                          </li>
                          <li>
                            <a
                              className="fa fa-linkedin"
                              href="https://www.linkedin.com/in/ashwini-kumar-maurya-531554205/"
                            >
                              &nbsp; linkedin
                            </a>
                          </li>
                          <li>
                            <a
                              className="fa fa-instagram"
                              href="https://www.instagram.com/ashwin_oo7/"
                            >
                              &nbsp; Instagram
                            </a>
                          </li>
                          <li>
                            <a
                              className="fa fa-youtube"
                              href="https://www.youtube.com/channel/UCXE9IrBDQDwf2If_S6XKKiw"
                            >
                              &nbsp; Youtube
                            </a>
                          </li>
                          <li>
                            <button
                              className="feedback-button"
                              id="feedback-button"
                              onClick={this.toggleFormVisibility}
                            >
                              Leave Feedback
                            </button>
                            {isFormVisible && (
                              <div className="feedback-form">
                                <form onSubmit={this.handleSubmit}>
                                  <label htmlFor="feedback">
                                    Your Feedback:
                                  </label>
                                  <textarea
                                    id="feedback"
                                    name="feedback"
                                    rows="4"
                                    cols="50"
                                    value={this.state.feedback}
                                    onChange={this.handleChange}
                                    placeholder="Enter your feedback here..."
                                  ></textarea>
                                  <input type="submit" value="Submit" />
                                </form>
                              </div>
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-6 col-sm-6">
                    <div className="footer-widget mb-30 ml-70">
                      <div className="footer-title">
                        <h3>SUBSCRIBE</h3>
                      </div>
                      <div className="subscribe-style">
                        <p>
                          Get E-mail updates about our latest shop and special
                          offers.
                        </p>

                        <div id="mc_embed_signup" className="subscribe-form">
                          <form
                            id="mc-embedded-subscribe-form"
                            className="validate"
                            noValidate=""
                            target="_blank"
                            name="mc-embedded-subscribe-form"
                            method="post"
                            action="#"
                          >
                            <div
                              id="mc_embed_signup_scroll"
                              className="mc-form"
                            >
                              <input
                                className="email"
                                type="email"
                                required=""
                                placeholder="Enter your email here.."
                                name="EMAIL"
                                // value=""
                                defaultValue="" // Uncontrolled input
                              />
                              <div className="mc-news" aria-hidden="true">
                                <input
                                  type="text"
                                  // value=""
                                  tabIndex="-1"
                                  name="b_6bbb9b6f5827bd842d9640c82_05d85f18ef"
                                  defaultValue="" // Uncontrolled input
                                />
                              </div>
                              <div className="clear">
                                <input
                                  id="mc-embedded-subscribe"
                                  className="button"
                                  type="submit"
                                  name="subscribe"
                                  value="Subscribe"
                                />
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
            {/* Modal */}
            <div
              className="modal fade"
              id="exampleModal"
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content" style={{ maxWidth: "100%" }}>
                  <div className="modal-header">
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      title="close modal"
                    ></button>
                  </div>
                  {this.state.selectedProduct &&
                    (() => {
                      const productId = this.state.selectedProduct._id;
                      if (!productId) return null; // Early return if productId is not available

                      const cartItem = this.findCartItem(productId);
                      const isProductInCart = !!cartItem;
                      const isCartQuantityMaxed =
                        isProductInCart &&
                        cartItem.variantQuantity === cartItem.variant.quantity;
                      const selectedOptions =
                        this.state.selectedOptions[
                          this.state.selectedProduct._id
                        ] || {};
                      const selectedColor =
                        selectedOptions.color ||
                        this.state.selectedProduct.variants?.[0].color; // Default to the first variant color

                      const selectedSizeVariants =
                        selectedOptions.size ||
                        getSizeOptions(
                          this.state.selectedProduct.variants,
                          selectedColor
                        )[0]?.size; // Default to the first size for the selected color

                      const variantPrice =
                        selectedOptions.variantPrice ||
                        this.state.selectedProduct.variants?.[0].sizes?.[0]
                          .price;

                      const variantMrpPrice =
                        selectedOptions.variantMrpPrice ||
                        this.state.selectedProduct.variants?.[0].sizes?.[0]
                          .mrpPrice;

                      const cartVariantQuantity =
                        selectedOptions.cartVariantQuantity ||
                        this.state.selectedProduct.variants?.[0].sizes?.[0]
                          .quantity;
                      return (
                        <div
                          className="modal-body"
                          onClick={() =>
                            this.fetchProductDetails(this.state.selectedProduct)
                          }
                        >
                          <div className="row">
                            <div className="col-md-5 col-sm-12 col-xs-12">
                              <div className="tab-content quickview-big-img">
                                <div
                                  id="pro-1"
                                  className="tab-pane fade show active img-container"
                                  onMouseEnter={this.handleImageLoad}
                                  onMouseLeave={() =>
                                    this.setState({ cx: 0, cy: 0 })
                                  }
                                >
                                  <img
                                    title={`product-image : ${this.state.selectedProduct.productName}`}
                                    src={
                                      this.state.selectedProduct
                                        ?.productImages[0]?.dataURL || ""
                                    }
                                    alt=""
                                    ref={this.imgRef}
                                    onMouseEnter={() => this.handleHover(true)}
                                    onMouseLeave={() => this.handleHover(false)}
                                  />
                                </div>
                                {this.state.selectedProduct.productImages.map(
                                  (image, index) => (
                                    <div
                                      key={`pro-${index}`}
                                      id={`pro-${index + 1}`}
                                      className={`tab-pane fade ${
                                        index === 1 ? "show active" : ""
                                      }`}
                                    >
                                      <img
                                        src={image.dataURL}
                                        title={`product-image : ${this.state.selectedProduct.productDescription}`}
                                        alt=""
                                      />
                                    </div>
                                  )
                                )}

                                <div id="pro-3" className="tab-pane fade">
                                  {/* <img
                            src={
                              this.state.selectedProduct.productImages[1]
                                .dataURL
                            }
                            alt=""
                          /> */}
                                </div>
                                <div id="pro-4" className="tab-pane fade">
                                  {/* <img
                            src={
                              this.state.selectedProduct.productImages[1]
                                .dataURL
                            }
                            alt=""
                          /> */}
                                </div>
                              </div>
                              {/* Thumbnail Large Image End */}
                              {/* Thumbnail Image End */}
                              <div className="quickview-wrap mt-15">
                                <div
                                  className="quickview-slide-active owl-carousel nav nav-style-1"
                                  role="tablist"
                                >
                                  <a
                                    className="active"
                                    data-bs-toggle="tab"
                                    href="#pro-1"
                                  >
                                    {/* <img
                              src={
                                this.state.selectedProduct.productImages[1]
                                  .dataURL
                              }
                              alt=""
                            /> */}
                                  </a>
                                  <a data-bs-toggle="tab" href="#pro-2">
                                    {/* <img
                              src={
                                this.state.selectedProduct.productImages[1]
                                  .dataURL
                              }
                              alt=""
                            /> */}
                                  </a>
                                  <a data-bs-toggle="tab" href="#pro-3">
                                    {/* <img
                              src={
                                this.state.selectedProduct.productImages[1]
                                  .dataURL
                              }
                              alt=""
                            /> */}
                                  </a>
                                  <a data-bs-toggle="tab" href="#pro-4">
                                    {/* <img
                              src={
                                this.state.selectedProduct.productImages[1]
                                  .dataURL
                              }
                              alt=""
                            /> */}
                                  </a>
                                </div>
                              </div>
                            </div>

                            {this.state.selectedProduct && (
                              <div
                                className="col-md-7 col-sm-12 col-xs-12"
                                onClick={() =>
                                  this.fetchProductDetails(
                                    this.state.selectedProduct
                                  )
                                }
                              >
                                <div className="product-details-content quickview-content">
                                  {/* {isHovered && ( */}
                                  <div
                                    id="myresult"
                                    ref={this.resultRef}
                                    className="img-zoom-result"
                                  ></div>
                                  {/* )} */}
                                  <h2>
                                    {this.state.selectedProduct.brandName}
                                  </h2>
                                  <div className="product-details-price">
                                    <span>
                                      &#8377;
                                      {variantPrice}
                                    </span>
                                    <span className="old">
                                      &#8377;
                                      {variantMrpPrice}
                                    </span>
                                  </div>
                                  <div className="pro-details-rating-wrap">
                                    <div className="pro-details-rating">
                                      {/* {this.renderAverageStarRating(
                                    this.state.productRatings[
                                      selectedProduct._id
                                    ],
                                    selectedProduct._id
                                  )} */}
                                      <ProductPage
                                        productId={selectedProduct._id}
                                      />
                                    </div>
                                    <span></span>
                                  </div>
                                  <p>
                                    {this.state.selectedProduct.categoryName}
                                    <br />
                                    {this.state.selectedProduct.subCategoryName}
                                    <br />
                                    {this.state.selectedProduct.productName}
                                    <br />
                                    <strong>
                                      {
                                        this.state.selectedProduct
                                          .productDescription
                                      }
                                    </strong>
                                    <br />
                                  </p>
                                  <div className="pro-details-list">
                                    <ul>
                                      <li>
                                        <div>
                                          <strong>
                                            Colour:{" "}
                                            <select
                                              style={{
                                                width: "auto",
                                                fontSize: "10px",
                                              }}
                                              value={selectedColor}
                                              onChange={(e) =>
                                                this.handleColorChange(
                                                  this.state.selectedProduct
                                                    ._id,
                                                  e.target.value
                                                )
                                              }
                                            >
                                              <option value="" disabled>
                                                Select Color
                                              </option>
                                              {this.state.selectedProduct
                                                .variants &&
                                                this.state.selectedProduct.variants?.map(
                                                  (variant, index) => (
                                                    <option
                                                      key={index}
                                                      value={variant.color}
                                                    >
                                                      {variant.color}
                                                    </option>
                                                  )
                                                )}
                                            </select>
                                          </strong>
                                        </div>

                                        <div>
                                          <h3>
                                            <select
                                              value={selectedSizeVariants}
                                              onChange={(e) =>
                                                this.handleSizeChange(
                                                  this.state.selectedProduct
                                                    ._id,
                                                  e.target.value
                                                )
                                              }
                                              style={{
                                                width: "auto",
                                                fontSize: "10px",
                                              }}
                                            >
                                              <option value="">
                                                Select Size
                                              </option>
                                              {getSizeOptions(
                                                this.state.selectedProduct
                                                  .variants,
                                                selectedColor
                                              ).map((size, index) => (
                                                <option
                                                  key={index}
                                                  value={size.size}
                                                >
                                                  {size.size}
                                                </option>
                                              ))}
                                            </select>
                                          </h3>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6">
                                          <div className="support-wrap mb-30 support-2">
                                            <div className="col-xl-8 col-lg-8 d-none d-lg-block">
                                              <div className="main-menu">
                                                <nav>
                                                  <ul>
                                                    <li>
                                                      <div className="support-content">
                                                        <p>
                                                          <i className="fa fa-angle-down">
                                                            Size_guide
                                                          </i>
                                                        </p>
                                                      </div>
                                                      <ul
                                                        className="mega-menu"
                                                        style={{
                                                          width: "600px",
                                                        }}
                                                      >
                                                        {" "}
                                                        <div className="support-icon">
                                                          <img
                                                            className="animated"
                                                            src="assets/img/icon-img/clothe_size.jpg"
                                                            alt=""
                                                          />
                                                        </div>
                                                      </ul>
                                                    </li>
                                                  </ul>
                                                </nav>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="pro-details-size-color">
                                    <div className="pro-details-color-wrap">
                                      {/* <span>Color</span> */}
                                      <div className="pro-details-color-content">
                                        <ul>
                                          {/* <li className="black"></li> */}
                                        </ul>
                                      </div>
                                    </div>
                                    <div className="pro-details-size"></div>
                                  </div>
                                  <div
                                    className="pro-details-quality"
                                    style={{}}
                                  >
                                    <div
                                      className="pro-details-cart btn-hover"
                                      style={{}}
                                    >
                                      {this.isProductInCart(
                                        this.state.selectedProduct,
                                        selectedColor,
                                        selectedSizeVariants
                                      ) &&
                                      this.getProductQuantity(
                                        this.state.selectedProduct,
                                        selectedColor,
                                        selectedSizeVariants
                                      ) > 0 ? (
                                        <div
                                          className="remove-button-container"
                                          style={{
                                            marginLeft: "-25px",
                                            marginBottom: "-35px",
                                            paddingRight: "5px",
                                          }}
                                        >
                                          <FaMinus
                                            style={{}}
                                            title="Remove"
                                            className="quantity-button minus"
                                            onClick={() =>
                                              handleRemoveFromCart2Variant(
                                                this.state.selectedProduct,
                                                this.state.cart,
                                                this.setCart,
                                                selectedSizeVariants,
                                                this.setSelectedSizes,
                                                selectedColor
                                              )
                                            }
                                          />
                                        </div>
                                      ) : null}
                                      {this.isProductInCart(
                                        this.state.selectedProduct
                                      ) ? (
                                        <button
                                          style={{
                                            backgroundColor: "blue",
                                            marginTop: "0px",
                                          }}
                                          onClick={() =>
                                            this.addToCartVariant(
                                              this.state.selectedProduct,
                                              selectedColor,
                                              selectedSizeVariants,
                                              cartVariantQuantity,
                                              variantPrice,
                                              variantMrpPrice
                                            )
                                          }
                                          title={
                                            isCartQuantityMaxed
                                              ? `This seller has only ${cartVariantQuantity} of these available. To see if more are available from another seller, go to the product detail page.`
                                              : "Add To Cart"
                                          }
                                          disabled={
                                            cartVariantQuantity <= 0 ||
                                            isCartQuantityMaxed
                                          }
                                        >
                                          <i className="pe-7s-cart"></i>

                                          {isCartQuantityMaxed
                                            ? `${this.getProductQuantity(
                                                this.state.selectedProduct,
                                                selectedColor,
                                                selectedSizeVariants
                                              )} Exceed`
                                            : `${this.getProductQuantity(
                                                this.state.selectedProduct,
                                                selectedColor,
                                                selectedSizeVariants
                                              )} Added In Cart`}
                                        </button>
                                      ) : (
                                        <button
                                          style={{
                                            backgroundColor: "blue",
                                            marginTop: "0px",
                                          }}
                                          onClick={() =>
                                            this.addToCartVariant(
                                              this.state.selectedProduct,
                                              selectedColor,
                                              selectedSizeVariants,
                                              cartVariantQuantity,
                                              variantPrice,
                                              variantMrpPrice
                                            )
                                          }
                                          title={
                                            cartVariantQuantity <= 0
                                              ? "Out of Stock"
                                              : "Add To Cart"
                                          }
                                          disabled={cartVariantQuantity <= 0}
                                        >
                                          {cartVariantQuantity <= 0 ? (
                                            <>
                                              <FaBan
                                                style={{ marginRight: "5px" }}
                                              />
                                              Out of Stock
                                            </>
                                          ) : (
                                            <>
                                              <i className="pe-7s-cart"></i> Add
                                              to cart
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                    <div style={{}}>
                                      <button
                                        style={{
                                          backgroundColor: "blue",
                                          marginTop: "-3px",
                                          borderRadius: "115px",
                                        }}
                                      >
                                        <a
                                          href="/cart-page"
                                          className="view-cart"
                                          style={{
                                            color: "white",
                                            textDecoration: "none",
                                          }}
                                        >
                                          View Cart
                                        </a>
                                      </button>
                                    </div>

                                    <div
                                      className="pro-details-wishlist"
                                      style={{ paddingLeft: "5px" }}
                                    >
                                      <a href="/#">
                                        <i className="fa fa-heart-o"></i>
                                      </a>
                                    </div>
                                    <div className="pro-details-compare">
                                      <a href="/#">
                                        <i className="pe-7s-shuffle"></i>
                                      </a>
                                    </div>
                                  </div>

                                  <div className="pro-details-social">
                                    <ul>
                                      <li>
                                        <a href="https://www.facebook.com/ASHMI6oo7/">
                                          <i className="fa fa-facebook"></i>
                                        </a>
                                      </li>
                                      <li>
                                        <a href="https://www.youtube.com/@ashwin0401">
                                          <i className="fa fa-youtube"></i>
                                        </a>
                                      </li>
                                      <li>
                                        <a href="/#">
                                          <i className="fa fa-twitter"></i>
                                        </a>
                                      </li>
                                      <br />
                                      <li>
                                        <a href="https://www.linkedin.com/in/ashwini-kumar-maurya-531554205/">
                                          <i className="fa fa-linkedin"></i>
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </div>
            </div>
            {localStorage.getItem("hide") && <Header cart={cart} />}
            {/* {!localStorage.getItem("userEmail") && <MainPopup />} */}
          </div>
        )}
      </>
    );
  }
}
