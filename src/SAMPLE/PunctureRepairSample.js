// PunctureRepairForm.js
import React, { Component } from "react";
import "../css/PunctureRepair.css";
import axios from "axios";
import { FaWrench, FaMapMarkerAlt, FaPhone, FaCar } from "react-icons/fa";
import { toast } from "react-toastify";

class PunctureRepair extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      mobileNumber: "",
      vehiclePlateNo: "",
      submitted: false,
      responseData: null,
      mobileVerified: false, // Track mobile verification status
    };
  }

  componentDidMount = async () => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("position", position.coords);
      this.getAddressData(position.coords.latitude, position.coords.longitude);
    });
  };
  getAddressData = async (lat, lng) => {
    try {
      this.setState({
        location: "Lattitude : " + lat + " , Longitude : " + lng,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  restrictToNumbers = (event) => {
    const regex = /[0-9]/; // Regular expression to match only numbers
    const inputValue = event.key;

    if (
      event.keyCode === 8 || // backspace
      event.keyCode === 46 || // delete
      event.keyCode === 9 || // tab
      event.keyCode === 27 || // escape
      event.keyCode === 13 // enter
    ) {
      return;
    }

    // Check if the input value matches the regex
    if (!regex.test(inputValue)) {
      event.preventDefault(); // Prevent the default action of the keypress
    }
  };

  handleLocationChange = (event) => {
    this.setState({ location: event.target.value });
  };

  handleMobileNumberChange = (event) => {
    const inputValue = event.target.value.replace(/\D/g, "");
    this.setState({ mobileNumber: inputValue });
  };

  handleVehiclePlateNoChange = (event) => {
    const inputValue = event.target.value.replace(/[^a-zA-Z0-9]/g, "");

    this.setState({ vehiclePlateNo: inputValue.toUpperCase() });
  };

  handleMobileVerification = async () => {
    try {
      // Send a request to backend to verify the mobile number
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "punctureRepair/verifyMobile",
        {
          mobileNumber: this.state.mobileNumber,
        }
      );
      if (response.status === 200) {
        // If mobile number is verified successfully
        this.setState({ mobileVerified: true });
      } else {
        toast.error("Failed to verify mobile number");
      }
    } catch (error) {
      console.error("Error verifying mobile number:", error);
      toast.error("Error verifying mobile number");
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { location, mobileNumber, vehiclePlateNo } = this.state;

    if (!location) {
      alert("Please Location On");

      return;
    }
    // Validate inputs
    if (!this.isValidMobileNumber(mobileNumber)) {
      toast.warning("Invalid Mobile Number.");
      return;
    }
    if (!this.isValidVehiclePlateNo(vehiclePlateNo)) {
      toast.warning("Please Provide 10-Character Plate Number.");
      return;
    }
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "punctureRepair/addPuncture",
        {
          location: this.state.location,
          mobileNumber: this.state.mobileNumber,
          vehiclePlateNo: this.state.vehiclePlateNo,
        }
      );
      console.log(response);
      if (response.status === 201) {
        console.log(response);
        toast.success("Product added successfully", { autoClose: 200 });
        this.setState({
          location: "",
          mobileNumber: "",
          vehiclePlateNo: "",
          submitted: true,
          responseData: response.data,
        });

        // Store the current time in local storage to track session expiration
        localStorage.setItem("lastSubmissionTime", new Date().getTime());
      } else {
        console.log(response);
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product");
    }
    this.sendRequestToAdmin(location, mobileNumber, vehiclePlateNo);
    setTimeout(() => {
      window.location.reload();
    }, 20000000);
    window.location =
      process.env.REACT_APP_API_URL_FOR_GUI +
      "/puncture-repair-list?mob=" +
      this.state.mobileNumber;
  };

  isValidMobileNumber = (mobileNumber) => {
    return /^\d{10}$/.test(mobileNumber);
  };

  isValidVehiclePlateNo = (vehiclePlateNo) => {
    return vehiclePlateNo.length === 10;
  };

  sendRequestToAdmin = (location, mobileNumber, vehiclePlateNo) => {
    console.log(`Emergency puncture repair request received:
          Location: ${location}
          Mobile Number: ${mobileNumber}
          Vehicle Plate No: ${vehiclePlateNo}`);

    this.setState({
      location: "",
      mobileNumber: "",
      vehiclePlateNo: "",
    });

    // For demonstration, let's just log the request
    toast.success("Request Sent To Maurya. Assistance Is On The Way");
  };

  render() {
    // const API_endpoint = `https://api.openweathermap.org/data/3.0/onecall?`;
    // const API_key = `6de0b93cf8421ed7f14ce2b3bdc6b704`;
    const {
      mobileNumber,
      vehiclePlateNo,
      submitted,
      responseData,
      mobileVerified,
    } = this.state;
    return (
      <div className="container">
        {/* Wrap the form inside a container */}
        {mobileVerified ? ( // Render form only if mobile number is verified
          <form className="puncture-repair-form">
            <h1>
              <FaWrench /> Puncture Repair
            </h1>
            <div>
              <label onClick={this.handleLocationChange}>
                <FaMapMarkerAlt /> Location
              </label>
              <label>
                <input
                  type="text"
                  placeholder="Pease  location On"
                  value={this.state.location}
                  style={{
                    backgroundColor: this.state.location ? "" : "#FFC0CB",
                  }}
                />
              </label>
            </div>
            <div>
              <label>
                <FaPhone /> Mobile Number :
                <input
                  type="text"
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  onKeyPress={this.restrictToNumbers}
                  value={mobileNumber}
                  onChange={this.handleMobileNumberChange}
                  style={{
                    borderColor: /^\d{10}$/.test(mobileNumber) ? "" : "red",
                  }}
                />
              </label>
            </div>
            <div>
              <label>
                <FaCar /> Vehicle Number :
                <input
                  style={{
                    borderColor: vehiclePlateNo.length === 10 ? "" : "red",
                  }}
                  type="text"
                  placeholder="Enter Vehicle Number"
                  maxLength={10}
                  value={vehiclePlateNo}
                  onChange={this.handleVehiclePlateNoChange}
                />
              </label>
            </div>
            <button onClick={this.handleSubmit}>Submit</button>
          </form>
        ) : (
          // Render mobile verification section if mobile number is not verified
          <div className="mobile-verification">
            <h2>Mobile Verification</h2>
            <div>
              <label>
                <FaPhone /> Mobile Number :
                <input
                  type="text"
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={this.handleMobileNumberChange}
                  style={{
                    borderColor: /^\d{10}$/.test(mobileNumber) ? "" : "red",
                  }}
                />
              </label>
            </div>
            <button onClick={this.handleMobileVerification}>
              Verify Mobile Number
            </button>
          </div>
        )}

        {submitted && responseData && (
          <div className="submitted-data">
            <h2>Submitted Data</h2>
            <p>Location: {responseData.location}</p>
            <p>Mobile Number: {responseData.mobileNumber}</p>
            <p>Vehicle Plate No: {responseData.vehiclePlateNo}</p>
          </div>
        )}
      </div>
    );
  }
}

export default PunctureRepair;
