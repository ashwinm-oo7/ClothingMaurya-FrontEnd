import React, { Component } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  FaEnvelope,
  FaCalendarAlt,
  FaComments,
  FaUserCog,
  FaTrash,
} from "react-icons/fa";
import "../css/Feedback.css";
import FeedbackDeleteConfirmationPopup from "./FeedbackDeleteConfirmationPopup";

class Feedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedbackList: [],
      userEmail: "",
      isAdmin: false,
      userName: "",
      expandedFeedbackIndex: null,
      deleteConfirmation: {
        isOpen: false,
        index: null,
        confirmationText: " ",
      },
      currentPage: 1,
      itemsPerPage: 5,
    };
    this.popupRef = React.createRef();
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

  handleDeleteConfirmation = (index) => {
    this.setState({
      deleteConfirmation: {
        isOpen: true,
        index: index,
        confirmationText: "",
      },
    });
  };
  handleConfirmationInputChange = (e) => {
    this.setState({
      deleteConfirmation: {
        ...this.state.deleteConfirmation,
        confirmationText: e.target.value,
      },
    });
  };

  handleDeleteCancel = () => {
    this.setState({
      deleteConfirmation: {
        isOpen: false,
        index: null,
        confirmationText: "",
      },
    });
  };

  handleDeleteConfirm = async () => {
    const { feedbackList, deleteConfirmation } = this.state;
    const { confirmationText } = deleteConfirmation;

    // Check if the confirmation text matches
    if (confirmationText === "Delete") {
      // Get the index of the feedback item to delete
      const indexToDelete = deleteConfirmation.index;

      const response = await axios.delete(
        process.env.REACT_APP_API_URL +
          `feedback/deleteFeedback/${feedbackList[indexToDelete]._id}`
      );
      console.log("Response", response);
      try {
        if (response.status === 200) {
          const updatedFeedbackList = [...feedbackList];
          updatedFeedbackList.splice(indexToDelete, 1);

          // Reset deletingIndex and close the confirmation dialog
          this.setState({
            feedbackList: updatedFeedbackList,
            deleteConfirmation: {
              isOpen: false,
              index: null,
              confirmationText: null,
            },
          });

          toast.success("Feedback deleted successfully.");
        } else {
          toast.error("Failed to delete else feedback.");
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
        toast.error("Failed to delete feedback.");
      }
    } else {
      toast.error("Please type 'Delete' to confirm deletion.");
    }
  };

  componentDidMount() {
    const userEmail = localStorage.getItem("userEmail");
    const isAdmin = localStorage.getItem("isAdmin") === "true"; // Check if user is admin
    const userName = localStorage.getItem("userName");

    if (userEmail) {
      this.setState({ userEmail, isAdmin, userName });
    }
    this.fetchFeedback(isAdmin);
    document.addEventListener("mousedown", this.handleClickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (this.popupRef && !this.popupRef.current.contains(event.target)) {
      this.handleDeleteCancel();
    }
  };

  fetchFeedback = async (isAdmin) => {
    try {
      let response;
      if (isAdmin) {
        response = await axios.get(
          process.env.REACT_APP_API_URL +
            "feedback/getAllFeedback" +
            `?admin=true&userEmail=${this.state.userEmail}`
        );
      } else {
        // If user is not admin, don't include user email in request
        response = await axios.get(
          `${process.env.REACT_APP_API_URL}feedback/getAllFeedback`
        );
      }
      const sortedFeedback = response.data.reverse();
      console.log("Sorted feedback:", sortedFeedback);

      this.setState({ feedbackList: sortedFeedback });
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  toggleFeedbackExpansion = (index) => {
    this.setState((prevState) => ({
      expandedFeedbackIndex:
        prevState.expandedFeedbackIndex === index ? null : index,
    }));
  };

  render() {
    const {
      feedbackList,
      isAdmin,
      deleteConfirmation,
      currentPage,
      itemsPerPage,
    } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = feedbackList.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <div className="feedback-list">
        <th style={{ backgroundColor: "black" }}>
          {isAdmin && <FaUserCog />} Admin
        </th>
        <td>
          {isAdmin && (
            <label className="feedback-label">
              {this.state.userName} : {this.state.userEmail}
            </label>
          )}
        </td>
        <table>
          <thead>
            <tr>
              <th>
                <FaEnvelope style={{ color: "" }} />
                {"  "}
                User Email
              </th>
              <th className="date-header">
                <FaCalendarAlt style={{ color: "" }} />
                {"  "}Date
              </th>
              <th>
                <FaComments style={{ color: "" }} /> Feedback
              </th>
              <th>
                <FaTrash />
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((feedback, index) => (
              <tr key={index}>
                <td className="mobile feedbackmail">
                  {" "}
                  {isAdmin && feedback.userEmail
                    ? feedback.userEmail
                    : "Anonymous"}
                </td>
                <td className="date-header feedbackmail">
                  {feedback.createdAt}
                </td>
                <td className="mobile mobiles ">
                  {feedback.feedback.length > 30 ? (
                    <div
                      className="horizontal-scroll"
                      title={feedback.feedback}
                    >
                      {feedback.feedback}
                    </div>
                  ) : (
                    feedback.feedback
                  )}
                </td>
                &nbsp; &nbsp;
                <FaTrash onClick={() => this.handleDeleteConfirmation(index)} />
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <strong style={{ marginLeft: "2%" }}>
            Item : {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, feedbackList.length)} of{" "}
            {feedbackList.length}
          </strong>
          <strong style={{ marginLeft: "80%" }}>Page : {currentPage}</strong>
        </div>

        <div className="pagination">
          <button
            style={{ width: "30%", marginLeft: "200px" }}
            onClick={this.prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            style={{ width: "30%", marginLeft: "100px" }}
            onClick={this.nextPage}
            disabled={indexOfLastItem >= feedbackList.length}
          >
            Next
          </button>
        </div>
        <div ref={this.popupRef}>
          <FeedbackDeleteConfirmationPopup
            isOpen={deleteConfirmation.isOpen}
            onCancel={this.handleDeleteCancel}
            onConfirm={this.handleDeleteConfirm}
            onInputChange={this.handleConfirmationInputChange}
          />
        </div>
      </div>
    );
  }
}

export default Feedback;
