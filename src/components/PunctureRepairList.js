// PunctureRepairList.js
import React, { Component } from "react";
import axios from "axios";
import "../css/PunctureRepair.css";
import { toast } from "react-toastify";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup.js";

import {
  FaMapMarkerAlt,
  FaPhone,
  FaCar,
  FaTools,
  FaInfoCircle,
  FaRupeeSign,
  FaExclamationCircle,
  FaTrash,
} from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

class PunctureRepairList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      punctureRepairs: [],
      statusStr: [],
      loading: true,
      mobileNumber: "",
      isAdmin: false,
      totalAmount: 0,
      reloadTimer: localStorage.getItem("reloadTimer") || null, // Initial value of reload timer (in seconds)
      deleteConfirmation: {
        isOpen: false,
        repairId: null,
        mobileNumber: "",
      },
      currentPage: 1,
      itemsPerPage: 5,
    };
    this.socket = new WebSocket("ws://localhost:8080"); // Replace with your server URL

    const params = new URLSearchParams(window.location.search);
    console.log(params.get("isAdmin"));
    this.state.mobileNumber = params.get("mob");
    this.state.isAdmin = params.get("isAdmin");
  }
  nextPage = () => {
    this.setState((prevState) => ({
      currentPage: prevState.currentPage + 1,
    }));
  };

  prevPage = () => {
    this.setState((prevState) => ({
      currentPage: prevState.currentPage - 1,
    }));
  };

  handleDeleteConfirmation = (_id, mobileNumber) => {
    this.setState({
      deleteConfirmation: {
        isOpen: true,
        repairId: _id,
        mobileNumber: mobileNumber,
      },
    });
  };

  handleDeleteCancel = () => {
    this.setState({
      deleteConfirmation: {
        isOpen: false,
        repairId: null,
        mobileNumber: "",
      },
    });
  };

  handleDeleteConfirm = async () => {
    const { repairId, mobileNumber } = this.state.deleteConfirmation;
    if (this.state.mobileNumber !== mobileNumber) {
      toast.error("Mobile number does not match. Cannot delete repair.");
      return;
    }
    const response = await axios.delete(
      process.env.REACT_APP_API_URL + `punctureRepair/deleteRepair/${repairId}`
    );
    console.log("RESPONSE", response);

    try {
      if (response.status === 200) {
        this.setState((prevState) => ({
          punctureRepairs: prevState.punctureRepairs.filter(
            (repair) => repair._id !== repairId
          ),
        }));
        toast.success("Repair deleted successfully.");
      } else {
        // Display an error toast message if the deletion failed
        toast.error("Failed to deleted");
      }
    } catch (error) {
      console.error("Error deleting repair:", error);
      toast.error("Failed to delete repair.");
    }

    // Close the delete confirmation dialog
    this.handleDeleteCancel();
  };

  componentDidMount() {
    this.socket = new WebSocket("ws://localhost:8080");

    this.socket.addEventListener("message", (event) => {
      try {
        // Handle incoming WebSocket messages
        const message = JSON.parse(event.data);

        if (message.type === "deleteRepair") {
          // If the message indicates a deleted repair, update the state to remove the deleted repair
          const deletedRepairId = message.repairId;
          this.setState((prevState) => ({
            punctureRepairs: prevState.punctureRepairs.filter(
              (repair) => repair._id !== deletedRepairId
            ),
          }));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    // Listen for WebSocket open event
    this.socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
    });

    // Listen for WebSocket message event
    this.socket.addEventListener("message", (event) => {
      try {
        // Handle incoming status updates from the server
        const updatedRepair = JSON.parse(event.data);
        this.setState((prevState) => ({
          punctureRepairs: prevState.punctureRepairs.map((repair) =>
            repair._id === updatedRepair._id ? updatedRepair : repair
          ),
        }));
      } catch (error) {
        console.error("Error parsing JSON in handleSocketMessage:", error);
        // Handle the parsing error gracefully...
      }
    });

    // Listen for WebSocket close event
    this.socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    if (this.state.mobileNumber) {
      this.fetchPunctureRepairsByMobile();
    } else if (this.state.isAdmin) {
      this.fetchPunctureRepairs();
    }
    this.getAllStatusStr();
  }

  componentWillUnmount() {
    // Clear the interval when component unmounts to prevent memory leaks
    clearInterval(this.timerID);
    if (this.socket) {
      this.socket.close();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if isAdmin or mobileNumber has changed
    if (
      prevState.isAdmin !== this.state.isAdmin ||
      prevState.mobileNumber !== this.state.mobileNumber
    ) {
      if (this.state.mobileNumber) {
        this.fetchPunctureRepairsByMobile();
      } else if (this.state.isAdmin) {
        this.fetchPunctureRepairs();
      }
    }
  }

  handleSocketMessage = (event) => {
    try {
      // Handle incoming status updates from the server
      const updatedRepair = JSON.parse(event.data);
      this.setState((prevState) => ({
        punctureRepairs: prevState.punctureRepairs.map((repair) =>
          repair._id === updatedRepair._id ? updatedRepair : repair
        ),
      }));
    } catch (error) {
      console.error("Error parsing JSON in handleSocketMessage:", error);
      // Handle the parsing error gracefully...
    }
  };

  getAllStatusStr = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "punctureRepair/getAllStatusStr"
      );
      console.log("Request for Repairing", process.env.REACT_APP_API_URL);
      this.setState({ statusStr: response.data });
    } catch (error) {
      console.error("Error fetching puncture repairs:", error);
      // Handle error
    }
  };

  fetchPunctureRepairsByMobile = async () => {
    try {
      // Check if session has expired
      const lastSubmissionTime = localStorage.getItem("lastSubmissionTime");
      if (lastSubmissionTime) {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - parseInt(lastSubmissionTime);
        console.log("Elapsed time:", elapsedTime); // Add this line

        const sessionExpirationTime = 2 * 60 * 60 * 1000;
        // 2 hours in milliseconds
        // const sessionExpirationTime = 3 * 1000;
        // 30 seconds in milliseconds
        console.log("Session expiration time:", sessionExpirationTime); // Add this line

        if (elapsedTime >= sessionExpirationTime) {
          // Session is still valid, show error message or take appropriate action
          localStorage.removeItem("lastSubmissionTime");
        } else {
          // const apiUrl = process.env.REACT_APP_API_URL;

          // console.log("API " + apiUrl);
          const response = await axios.get(
            process.env.REACT_APP_API_URL +
              `punctureRepair/getPunctureRepairByMobileList/${this.state.mobileNumber}`
          );
          console.log("Request for user mobile Repairing", response.data);
          const repairList = response.data;
          if (repairList.length > 0) {
            this.setState(
              {
                punctureRepairs: repairList,
                loading: false,
                reloadTimer: Math.floor(
                  (sessionExpirationTime - elapsedTime) / 1000
                ), // Set reload timer based on remaining time
                fetchPunctureRepairsByMobileCalled: true,
              },
              () => {
                // Start countdown timer
                this.timerID = setInterval(() => {
                  this.setState(
                    (prevState) => ({
                      reloadTimer:
                        prevState.reloadTimer > 0
                          ? prevState.reloadTimer - 1
                          : 0,
                    }),
                    () => {
                      // Update localStorage with new timer value
                      localStorage.setItem(
                        "reloadTimer",
                        this.state.reloadTimer
                      );
                    }
                  );
                }, 1000); // Update timer every second
              }
            );
          } else {
            // Clear the interval if no puncture repairs are fetched
            clearInterval(this.timerID);
          }

          return;
        }
      }

      toast.error("Session has expired. Please try again later.");
    } catch (error) {
      console.error("Error fetching puncture repairs:", error);
    }
  };

  fetchPunctureRepairs = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "punctureRepair/getPunctureRepairList"
      );
      console.log("Request for Admin Repairing", response.data);
      const repairList = response.data.reverse();

      this.setState({ punctureRepairs: repairList, loading: false });
    } catch (error) {
      console.error("Error fetching puncture repairs:", error);
      // Handle error
    }
  };

  handleRepairStatusChange = async (_id, status) => {
    try {
      // Update the repair status locally
      this.setState((prevState) => ({
        punctureRepairs: prevState.punctureRepairs.map((repair) =>
          repair._id === _id ? { ...repair, status } : repair
        ),
      }));

      console.log(this.state.totalAmount);
      this.socket.send(JSON.stringify({ _id, status }));

      await axios.put(
        process.env.REACT_APP_API_URL +
          `punctureRepair/updateRepairStatus/${_id}/${status}`,
        { status }
      );
    } catch (error) {
      console.error("Error updating repair status:", error);
      // Handle error
    }
  };

  handleTotalAmtChange = async (e, _id, repair, amt) => {
    try {
      // Update the repair status locally
      repair.totalAmount = amt;
      this.setState((prevState) => ({
        punctureRepairs: prevState.punctureRepairs.map((repair) =>
          repair._id === _id ? { ...repair, totalAmount: amt } : repair
        ),
      }));

      // Update the total amount in the state
      // this.setState({ totalAmount });

      await axios.put(
        process.env.REACT_APP_API_URL +
          `punctureRepair/updateAmout/${_id}/${amt}`,
        { amt }
      );
    } catch (error) {
      console.error("Error updating repair status:", error);
      // Handle error
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

  render() {
    const {
      punctureRepairs,
      loading,
      reloadTimer,
      fetchPunctureRepairsByMobileCalled,
      deleteConfirmation,
      currentPage,
      itemsPerPage,
    } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = punctureRepairs.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    const verifiedPunctureRepairs = punctureRepairs.filter(
      (repair) => repair.verify
    );

    // Calculate the total number of items considering only verified repairs
    const totalItemCount = verifiedPunctureRepairs.length;

    // Calculate the number of items to display based on pagination
    const maxIndex = Math.min(indexOfLastItem, totalItemCount);
    const minIndex = Math.min(indexOfFirstItem, totalItemCount);

    if (loading) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <div className="puncture-repair-list-container">
        <h2>
          <FaTools style={{ marginRight: "5px" }} />
          {this.state.isAdmin
            ? "Admin Puncture Repair List"
            : "Your Puncture Repairs"}
        </h2>

        <div className="puncture-repair-list-header">
          <span className="puncture-repair-list-header-item">
            <FaMapMarkerAlt style={{ marginRight: "5px" }} />
            Location
          </span>
          <span className="puncture-repair-list-header-item">
            <FaPhone style={{ marginRight: "5px" }} />
            Mobile No
          </span>
          <span className="puncture-repair-list-header-item">
            <FaCar style={{ marginRight: "5px" }} />
            Vehicle Number
          </span>
          <span className="puncture-repair-list-header-item">
            <FaRupeeSign style={{ marginRight: "5px" }} />
            Total Amount
          </span>
          <span className="puncture-repair-list-header-item status">
            {" "}
            <FaInfoCircle style={{ marginRight: "5px" }} />
            Status
          </span>
        </div>

        {fetchPunctureRepairsByMobileCalled &&
          reloadTimer !== null && ( // Display countdown timer only if reload timer is set
            <div className="reload-timer">
              {reloadTimer > 0 ? (
                <div
                  style={{
                    color: reloadTimer < 3600 ? "orange" : "green",
                    fontWeight: "bold",
                  }}
                  className={reloadTimer < 3600 ? "blinking" : ""}
                >
                  Session will expire in{" "}
                  {`${Math.floor(reloadTimer / 3600)}:${Math.floor(
                    (reloadTimer % 3600) / 60
                  )}:${reloadTimer % 60}`}{" "}
                  <IoMdTime className="time-icon" />
                </div>
              ) : (
                <div style={{ color: "red", fontWeight: "bold" }}>
                  <FaExclamationCircle className="time-icon" /> Session
                  Expired...Refresh the Page
                </div>
              )}
            </div>
          )}
        <ul className="puncture-repair-list">
          {currentItems.map(
            (repair) =>
              repair.verify && (
                <li key={repair._id} className="puncture-repair-item">
                  <span>{repair.location}</span>
                  <span>{repair.mobileNumber}</span>
                  <span>{repair.vehiclePlateNo}</span>
                  <span>
                    {/* <>&#8377;</>   */}
                    <input
                      disabled={
                        !this.state.isAdmin || repair.status === "Success"
                      }
                      type="number"
                      onKeyPress={this.restrictToNumbers}
                      className="form-control"
                      placeholder="Total Amount"
                      value={repair.totalAmount}
                      onChange={(e) =>
                        this.handleTotalAmtChange(
                          e,
                          repair._id,
                          repair,
                          e.target.value
                        )
                      }
                    />
                  </span>
                  {this.state.isAdmin ? (
                    <span>
                      <select
                        title="status update"
                        value={repair.status}
                        onChange={(e) =>
                          this.handleRepairStatusChange(
                            repair._id,
                            e.target.value
                          )
                        }
                        className={
                          repair.status === "In Progress"
                            ? "orange"
                            : repair.status === "Rejected"
                            ? "red"
                            : repair.status === "Success" ||
                              repair.status === "Approved"
                            ? "green"
                            : repair.status === "Failed To Repair"
                            ? "red"
                            : "blue"
                        }
                      >
                        {this.state.statusStr.map((str, index2) => (
                          <option value={str}> &#x25CF; {str}</option>
                        ))}
                      </select>
                      <FaTrash
                        title="delete the repair details"
                        onClick={() =>
                          this.handleDeleteConfirmation(
                            repair._id,
                            repair.mobileNumber
                          )
                        }
                      />
                    </span>
                  ) : (
                    <span>
                      <select
                        disabled
                        className={
                          repair.status === "In Progress"
                            ? "orange"
                            : repair.status === "Rejected"
                            ? "red"
                            : repair.status === "Success" ||
                              repair.status === "Approved"
                            ? "green"
                            : repair.status === "Failed To Repair"
                            ? "red"
                            : "blue"
                        }
                        style={{
                          appearance: "none",
                          paddingLeft: "20px",
                        }}
                      >
                        <option>{repair.status}</option>
                      </select>
                    </span>
                  )}
                </li>
              )
          )}
        </ul>
        {!fetchPunctureRepairsByMobileCalled ? (
          <div>
            <strong>
              Item : {minIndex + 1} - {maxIndex} of {totalItemCount}
            </strong>
            <strong style={{ marginLeft: "80%" }}>Page : {currentPage}</strong>
          </div>
        ) : (
          <></>
        )}

        {!fetchPunctureRepairsByMobileCalled ? (
          <div className="pagination" style={{ paddingBottom: "10px" }}>
            <button
              style={{ width: "30%", marginLeft: "150px" }}
              onClick={this.prevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              style={{ width: "30%", marginLeft: "200px" }}
              onClick={this.nextPage}
              disabled={indexOfLastItem >= this.state.punctureRepairs.length}
            >
              Next
            </button>
          </div>
        ) : (
          <></>
        )}

        <DeleteConfirmationPopup
          isOpen={deleteConfirmation.isOpen}
          mobileNumber={deleteConfirmation.mobileNumber}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
          onMobileNumberChange={(e) =>
            this.setState({ mobileNumber: e.target.value })
          }
        />
      </div>
    );
  }
}

export default PunctureRepairList;
