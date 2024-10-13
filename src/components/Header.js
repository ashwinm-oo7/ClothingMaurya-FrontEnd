import React, { useState, useEffect } from "react";
import {
  FaMinus,
  FaPlus,
  FaUser,
  FaUserShield,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";
import "../css/home.css";
import logo from "../icons/maurya.png";
import { Link } from "react-router-dom";
import {
  calculateTotal,
  fetchAllCart,
  handleVariantAddToCart,
  handleRemoveFromCart2Variant,
  handleRemoveFromCartVariant,
} from "./cartFunctions.js";

import Search from "./Search";

const Header = () => {
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSizes, setSelectedSizeVariants] = useState("");
  // const [userId, setUserId] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchAllCart(setCart, setSelectedSizeVariants);
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      fetchUserProfile(storedUserId);
    } else {
      const storedCart = JSON.parse(localStorage.getItem("carts")) || [];
      setCart(storedCart);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}user/profile/${userId}`
      );
      if (response.ok) {
        const userData = await response.json();
        setIsAdmin(userData.isAdmin);
        // setUserId(userData._id);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const logout = () => {
    try {
      const userId = localStorage.getItem("userId");
      if (userId) {
        axios.post(`${process.env.REACT_APP_API_URL}user/logout/${userId}`);
        localStorage.clear();
        window.location = `${process.env.REACT_APP_API_URL_FOR_GUI}/login`;
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const addToCartVariant = async (
    product,
    selectedColor,
    selectedSizeVariants,
    cartVariantQuantity,
    variantPrice,
    variantMrpPrice,
    selectedVariant
  ) => {
    // const selectedVariant = getVariantDetails();
    if (!product.selectedSizes && product.selectedColor) {
      alert("Please select a valid size and color");
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await handleVariantAddToCart(
      product,
      cart,
      setCart,
      selectedSizeVariants,
      setSelectedSizeVariants,
      selectedColor,
      cartVariantQuantity,
      variantPrice,
      variantMrpPrice
    );
    setIsProcessing(false);
  };

  // Function to handle input blur

  const findCartItem = (productId) => {
    return cart.find((item) => item._id === productId);
  };

  return (
    <div className="" style={{ userSelect: "none" }}>
      <header className="header-area header-padding-1 sticky-bar header-res-padding clearfix">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-2 col-lg-2 col-md-6 col-4">
              <div className="logo" title="" style={{ userSelect: "none" }}>
                <a href="/">
                  <img
                    src={logo}
                    alt="My-first-design-2"
                    style={{ width: "120px", height: "auto" }}
                  />
                </a>
              </div>
            </div>
            <div className="col-xl-8 col-lg-8 d-none d-lg-block">
              <div className="main-menu" style={{ backgroundColor: "#e6f6ff" }}>
                <nav>
                  <ul>
                    <li>
                      <a href="/#">
                        <FaUser /> Profile
                        <i className="fa fa-angle-down"></i>
                      </a>
                      <ul className="submenu">
                        {" "}
                        <li>
                          <p>
                            {localStorage.getItem("userEmail") ? (
                              <a onClick={() => logout()} href="/login">
                                Logout
                              </a>
                            ) : (
                              <Link to="/login">login / register</Link>
                            )}
                          </p>
                        </li>
                        <li>
                          <a href="/about">about us</a>
                        </li>
                        <li>{/* <a href="/#">cart page</a> */}</li>
                        <li>
                          <Link to="/cart-page">checkout</Link>
                        </li>
                        <li>{/* <a href="/#">wishlist </a> */}</li>
                        {localStorage.getItem("userEmail") ? (
                          <>
                            <li>
                              <Link to="/myAccount">My Account</Link>
                            </li>
                            <li>
                              <Link to="/pdf-download">HistoryInvoice</Link>
                            </li>
                          </>
                        ) : (
                          ""
                        )}
                      </ul>
                    </li>
                    <li>
                      <Search />
                    </li>
                    {isAdmin ? (
                      <li>
                        <a href="/#">
                          <FaUserShield /> Vendor{" "}
                          <i className="fa fa-angle-down"></i>
                        </a>
                        <ul className="submenu">
                          <li>
                            <a href="/add-brand">Add Brand</a>
                          </li>
                          <li>
                            <a href="/product-list">Product List</a>
                          </li>
                          <li>
                            <a href="/feedback-list">Feedback List</a>
                          </li>
                          <li>
                            <a href="/payment-info">User Payment Details</a>
                          </li>
                          <li>
                            <a href="/order-list">Order Details</a>
                          </li>
                          <li>
                            <a href="/login-record ">Login Record</a>
                          </li>
                        </ul>
                      </li>
                    ) : (
                      <></>
                    )}
                    <li>
                      <a href="/about">
                        <FaInfoCircle /> About Us
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            <div className="col-xl-2 col-lg-2 col-md-6 col-8">
              <div className="header-right-wrap">
                {localStorage.getItem("userEmail") ? (
                  <div className="same-style account-satting">
                    <a className="account-satting-active" href="/#">
                      <i className="pe-7s-user-female"></i>
                    </a>
                    <div className="account-dropdown">
                      <ul>
                        <li>
                          <p>
                            {localStorage.getItem("userEmail") ? (
                              <a onClick={() => logout()} href="/login">
                                Logout
                              </a>
                            ) : (
                              <Link to="/login">login</Link>
                            )}
                          </p>
                        </li>

                        <li>
                          <a href="/sign-up">Register</a>
                        </li>
                        <li>
                          <a href="/#">Wishlist </a>
                        </li>
                        <li>
                          <Link to="/myAccount">My Account</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="same-style account-satting">
                    <a className="account-satting-active" href="/#">
                      <i className="pe-7s-user-female"></i>
                    </a>
                    <div className="account-dropdown">
                      <ul>
                        <li>
                          <a href="/login">Login</a>
                        </li>
                        <li>
                          <a href="/sign-up">Register</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                {selectedProduct && (
                  <div className="same-style header-wishlist">
                    <a href="/#">
                      <i className="pe-7s-like"></i>
                      <p>{selectedProduct.productName}</p>
                    </a>
                  </div>
                )}
                {/* 888888888888 CART LIST 888888888888888888888888888 */}
                <div className="same-style mega-menu cart-wrap">
                  {isProcessing && (
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

                  <button className="icon-cart">
                    <i
                      className="pe-7s-shopbag"
                      onClick={() => (window.location.href = `/cart-page`)}
                    ></i>
                    <span className="count-style">{cart && cart.length}</span>
                  </button>
                  <div
                    className="shopping-cart-content"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    <ul>
                      {cart && cart.length > 0 ? (
                        cart.map((item, index) => {
                          const cartItem = findCartItem(item._id);
                          const isProductInCart = !!cartItem;
                          const isCartQuantityMaxedVariant =
                            isProductInCart &&
                            item.variantQuantity >= item.variant.quantity;
                          const matchingImage = item.productImages
                            .filter(
                              (image) =>
                                image.color.toLowerCase() ===
                                item.selectedColor.toLowerCase()
                            )
                            .find(
                              (image) =>
                                !image.dataURL.startsWith("data:video/")
                            );

                          return (
                            <li className="single-shopping-cart" key={index}>
                              <div className="shopping-cart-img">
                                <div className="shopping-cart-delete">
                                  <button
                                    style={{ top: "" }}
                                    onClick={() =>
                                      handleRemoveFromCartVariant(
                                        index,
                                        cart,
                                        setCart,
                                        item._id
                                      )
                                    }
                                  >
                                    <i className="fa fa-times-circle"></i>
                                  </button>
                                </div>
                                <a href="/#">
                                  {matchingImage ? (
                                    <img
                                      style={{ width: "100px" }}
                                      alt={item.productName}
                                      src={matchingImage.dataURL} // Display the matching image
                                      className="cart-image"
                                      onClick={() =>
                                        (window.location.href = `/product?id=${item._id}&color=${item.selectedColor}&size=${item.selectedSizes}`)
                                      }
                                    />
                                  ) : (
                                    <p>
                                      No image available for the selected color.
                                    </p>
                                  )}
                                </a>
                              </div>
                              <div className="quantity-controls">
                                <FaMinus
                                  className={
                                    item.variantQuantity > 1
                                      ? "cart-quantity-button minus"
                                      : "cart-quantity-button minus disabled"
                                  }
                                  onClick={() =>
                                    item.variantQuantity > 1 &&
                                    handleRemoveFromCart2Variant(
                                      item,
                                      cart,
                                      setCart,
                                      item.selectedSizes,
                                      setSelectedSizeVariants,
                                      item.selectedColor,
                                      setIsProcessing
                                    )
                                  }
                                />

                                <div
                                  className="quantity-display"
                                  style={{
                                    userSelect: "none",
                                    pointerEvents: "none",
                                  }}
                                >
                                  {item.variantQuantity}
                                </div>
                                <FaPlus
                                  className="quantity-button plus"
                                  onClick={() =>
                                    !isCartQuantityMaxedVariant &&
                                    addToCartVariant(
                                      item,
                                      item.selectedColor,
                                      item.selectedSizes,
                                      item.variant.quantity,
                                      item.variantPrice,
                                      item.variantMrpPrice,
                                      item.variant
                                    )
                                  }
                                  style={{
                                    cursor: isCartQuantityMaxedVariant
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: isCartQuantityMaxedVariant
                                      ? 0.5
                                      : 1,
                                  }}
                                  title={
                                    isCartQuantityMaxedVariant
                                      ? `This seller has only ${item.variant.quantity} of these available. To see if more are available from another seller, go to the product detail page.`
                                      : "Add to Cart"
                                  }
                                />
                              </div>

                              <div className="shopping-cart-title">
                                <div>
                                  <p>
                                    <strong>Size : </strong>
                                    {item.selectedSizes}
                                  </p>
                                  <a
                                    href={`/product?id=${item._id}`}
                                    key={index}
                                  >
                                    <span style={{ marginRight: "5px" }}></span>
                                    {item.productName}({item.selectedColor}_
                                    {item.selectedSizes})
                                  </a>
                                </div>
                                <h6>
                                  Available Stock :
                                  {item.variant?.quantity -
                                    item.variantQuantity}
                                </h6>
                                <span>&#8377; : {item.variantPrice} /pcs</span>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        <h3>Cart is Empty</h3>
                      )}
                    </ul>
                    {/* *******CART TOTAL *********** */}
                    <div className="shopping-cart-total">
                      <h4>
                        SubTotal:
                        <span className="shop-total">
                          &#8377;{calculateTotal(cart)}
                        </span>
                      </h4>
                      <h4>
                        Tax (12%):
                        <span className="shop-total">
                          &#8377;{(calculateTotal(cart) * 0.12).toFixed(2)}
                        </span>
                      </h4>
                      <h4>
                        Final Amount to Pay:
                        <span>
                          &#8377;{(calculateTotal(cart) * 1.12).toFixed(2)}
                        </span>
                      </h4>
                    </div>
                    <div className="shopping-cart-btn btn-hover text-center">
                      <Link to="/cart-page" className="default-btn">
                        view cart
                      </Link>
                      {/* <button className="default-btn">Checkout</button> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 77777777777777777777 */}
          </div>
          <div className="mobile-menu-area">
            <div className="mobile-menu" style={{ marginTop: "-" }}>
              <nav id="mobile-menu-active">
                <ul className="menu-overflow">
                  {/* {localStorage.getItem("isAdmin") === "true" ? ( */}
                  {isAdmin ? (
                    <li>
                      <a href="/#">
                        Vendor <i className=""></i>
                      </a>
                      <ul className="submenu">
                        <li>
                          <a href="/add-brand">Add Brand</a>
                        </li>
                        <li>
                          <a href="/CategoryList">CategoryList</a>
                        </li>
                        <li>
                          <a href="/product-list">Product List</a>
                        </li>
                        <li>
                          <a href="/feedback-list">Feedback List</a>
                        </li>
                        <li>
                          <a href="/payment-info">User Payment Details</a>
                        </li>
                        <li>
                          <a href="/order-list">Order Details</a>
                        </li>
                      </ul>
                    </li>
                  ) : (
                    <></>
                  )}
                  <li>
                    <a href="/home">HOME</a>
                    <ul>
                      <li>
                        <a href="/#">Collection</a>
                        <ul>
                          <li>
                            <a href="/#">Tops</a>
                          </li>
                          <li>
                            <a href="/#">Bottoms</a>
                          </li>
                          <li>
                            <a href="/#">Dresses</a>
                          </li>
                          <li>
                            <a href="/#">ActiveWear</a>
                          </li>
                          <li>
                            <a href="/#">OuterWear</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="/#">Shop</a>
                    <ul>
                      <li>
                        <a href="/#">Clothing Company</a>
                        <ul>
                          <li>
                            <a href="https://www.nike.com/in ">Nike</a>
                          </li>
                          <li>
                            <a href=" https://www.adidas.co.in/">ADIDAS</a>
                          </li>
                          <li>
                            <a href="www.allensolly.com">ALLENSOLLY</a>
                          </li>
                          <li>
                            <a href="https://www2.hm.com/en_in/index.html">
                              H&M
                            </a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="/#">Pages</a>
                    <ul>
                      <li>
                        <a href="/about">about us</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
