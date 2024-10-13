// PunctureRepairForm.js
import React, { Component } from "react";
import "../css/PunctureRepair.css";
import axios from "axios";
import {
  FaWrench,
  FaMapMarkerAlt,
  FaPhone,
  FaCar,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

class PunctureRepair extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "",
      mobileNumber: "",
      vehiclePlateNo: "",
      email: "",
      submitted: false,
      otp: "", // Add OTP state
      otpSubmitted: false, // Flag to track OTP form submission
      responseData: null,
      mapCoordinates: { lat: 0, lng: 0 },
      selectedPlace: null,
      countdown: 60,
    };
  }

  startCountdown = () => {
    // Update the countdown timer every second
    this.interval = setInterval(() => {
      // Decrease countdown value by 1 second
      this.setState((prevState) => ({
        countdown: prevState.countdown - 1,
      }));

      // Check if countdown reaches 0
      if (this.state.countdown <= 0) {
        // Stop the countdown
        clearInterval(this.interval);
        // Set OTP as expired
        this.setState({ otpExpired: true });
      }
    }, 1000); // 1000 milliseconds = 1 second
  };

  componentWillUnmount() {
    // Clear the interval when the component is unmounted
    clearInterval(this.interval);
  }

  // Inside componentDidMount method

  componentDidMount = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("position", position.coords);
        const { latitude, longitude, accuracy } = position.coords;

        // Check if the accuracy is below a certain threshold (e.g., 100 meters)
        if (accuracy) {
          this.setState({
            mapCoordinates: { lat: latitude, lng: longitude },
          });

          this.getAddressData(latitude, longitude);
        } else {
          // Prompt the user to confirm their location manually
          if (
            window.confirm(
              "Your location accuracy is low. Please confirm your location manually."
            )
          ) {
            // Redirect the user to a page where they can confirm their location manually
            // You can implement this functionality based on your application's design
            // Example: history.push('/confirm-location')
          }
        }
      },
      (error) => {
        console.error("Error retrieving geolocation:", error);
      }
    );
  };

  getAddressData = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`
      );

      console.log("Addres :", response);

      const address = response.data.display_name;
      this.setState({
        location: address + ",CoOrdinates " + lat + "," + lng,
      });
    } catch (error) {
      console.error("Error fetching address:", error);
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
  handleEmailChange = (event) => {
    this.setState({ email: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { location, mobileNumber, vehiclePlateNo, email } = this.state;

    if (!location) {
      alert("Please Location On");

      return;
    }
    if (!this.isValidEmail(email)) {
      toast.warning("Invalid Email Address.");
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
          email: this.state.email,
          vehiclePlateNo: this.state.vehiclePlateNo,
        }
      );
      console.log("ReSPONSE", response);
      if (response.status === 201) {
        toast.success("OTP sent to your email.");
        this.setState({ submitted: true, responseData: response.data }); // Open OTP form
        this.startCountdown();
        localStorage.setItem("lastSubmissionTime", new Date().getTime());

        toast.success("Product added successfully", { autoClose: 200 });
        setTimeout(() => {
          if (!this.state.otpSubmitted) {
            toast.error("OTP verification timed out. Please try again.");
            this.setState({ submitted: false }); // Reset submission state
            window.location.reload(); // Reload the page
          }
        }, 60000); // Wait for 1 minute

        // Store the current time in local storage to track session expiration
        // this.setState({
        //   location: "",
        //   mobileNumber: "",
        //   email: "",
        //   vehiclePlateNo: "",
        //   submitted: true,
        //   responseData: response.data,
        // });
        this.sendRequestToAdmin(location, mobileNumber, vehiclePlateNo);
      } else {
        console.log(response);
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product");
    }

    // setTimeout(() => {
    //   window.location.reload();
    // }, 20000000);
    // window.location =
    //   process.env.REACT_APP_API_URL_FOR_GUI +
    //   "/puncture-repair-list?mob=" +
    //   this.state.mobileNumber;
  };

  handleOTPSubmit = async (event) => {
    event.preventDefault();
    const { otp, responseData } = this.state;
    console.log("responseIDINSERT", this.state.responseData);

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "punctureRepair/verifyOtp",
        {
          responseData, // Send _id for verification
          otp,
        }
      );
      if (response.status === 200) {
        toast.success("OTP verified successfully. Proceeding to next step.");
        this.setState({ otpSubmitted: true }); // Mark OTP as submitted
        setTimeout(() => {
          window.location =
            process.env.REACT_APP_API_URL_FOR_GUI +
            "/puncture-repair-list?mob=" +
            this.state.mobileNumber;
        }, 3000); // Redirect after 3 seconds
      } else {
        toast.error("Failed to verify OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP");
    }
  };

  isValidMobileNumber = (mobileNumber) => {
    return /^\d{10}$/.test(mobileNumber);
  };

  isValidVehiclePlateNo = (vehiclePlateNo) => {
    return vehiclePlateNo.length === 10;
  };
  isValidEmail = (email) => {
    // Basic email validation using regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  sendRequestToAdmin = (location, mobileNumber, vehiclePlateNo) => {
    console.log(`Emergency puncture repair request received:
          Location: ${location}
          Mobile Number: ${mobileNumber}
          Vehicle Plate No: ${vehiclePlateNo}`);

    // For demonstration, let's just log the request
    toast.success("Request Sent To Maurya. Assistance Is On The Way");
  };

  handleMapClick = async (clickedPosition) => {
    console.log("Clicked position:", clickedPosition); // Log clicked position

    try {
      const lat = clickedPosition.latLng.lat();
      const lng = clickedPosition.latLng.lng();

      // Log the extracted latitude and longitude values
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`
      );
      console.log("CLICKING MAP: ", response);
      const locationName = response.data.display_name;
      this.setState({
        location: locationName,
        mapCoordinates: clickedPosition,
      });
    } catch (error) {
      console.error("Error fetching location name:", error);
    }
  };

  render() {
    const {
      mobileNumber,
      vehiclePlateNo,
      submitted,
      responseData,
      otp,
      otpSubmitted,
      mapCoordinates,
    } = this.state;
    const mapContainerStyle = {
      width: "100%",
      height: "300px",
    };

    return (
      <div>
        {submitted && !otpSubmitted && (
          <form className="otp-form" onSubmit={this.handleOTPSubmit}>
            <div>
              <strong style={{ color: "red" }}>
                Time left to verify OTP : {this.state.countdown} seconds
              </strong>
              <label>
                OTP:
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => this.setState({ otp: e.target.value })}
                />
              </label>
            </div>
            <button type="submit">Submit OTP</button>
          </form>
        )}
        {/* Wrap the form inside a container */}
        <div className="container">
          {!submitted && (
            <form className="puncture-repair-form">
              <h1>
                <FaWrench /> Puncture Repair
              </h1>
              <div>
                <label onClick={this.handleLocationChange}>
                  <FaMapMarkerAlt /> Location :
                </label>
                <label>
                  <input
                    type="text"
                    placeholder="Pease turn on location "
                    value={this.state.location}
                    style={{
                      backgroundColor: this.state.location ? "" : "#FFC0CB",
                    }}
                  />
                </label>
              </div>
              <div>
                <label>
                  <FaEnvelope /> Email Address:
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={this.state.email}
                    onChange={this.handleEmailChange}
                    style={{
                      borderColor: this.isValidEmail(this.state.email)
                        ? ""
                        : "red",
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
          )}
          <div className="map-container">
            <form>
              <LoadScript googleMapsApiKey={process.env.GOOGLEMAP_API}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCoordinates}
                  zoom={18}
                  onClick={this.handleMapClick} // Add click event listener to the map
                >
                  <Marker position={mapCoordinates} />
                </GoogleMap>
              </LoadScript>
            </form>
          </div>
        </div>
        {submitted && responseData && (
          <div className="submitted-data">
            <h2>Submitted Data</h2>
            <p>Location: {this.state.location}</p>
            <p>Mobile Number: {this.state.mobileNumber}</p>
            <p>Vehicle Plate No: {this.state.vehiclePlateNo}</p>
          </div>
        )}
      </div>
    );
  }
}

export default PunctureRepair;
