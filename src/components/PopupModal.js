// PopupModal.js

import React, { useState } from "react";
import "../css/PopupModal.css"; // Import CSS file for styling

function PopupModal({ selectedItem, handleCloseModal, handleUpdate }) {
  const [updatedItem, setUpdatedItem] = useState({ ...selectedItem });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log("updatedItem : ", updatedItem);
    // setUpdatedItem({ ...updatedItem, [name]: value });
  };

  // const handleSubmit = (param) => {
  //   console.log("updatedItem : ", param);

  //   handleUpdate(updatedItem, param);
  // };
  const handleSubmit = () => {
    // Determine the parameter based on whether the selectedItem is a subcategory or category
    const param = updatedItem.subCategoryName
      ? "subCategoryData"
      : "categoryData";

    // Pass the _id, updatedData, and param to the handleUpdate function
    handleUpdate(selectedItem._id, updatedItem, param);
  };

  return (
    <div className="popup-modal">
      <div className="modal-content">
        <span className="close" onClick={handleCloseModal}>
          &times;
        </span>
        <h2>Edit Details</h2>
        <form>
          <label>
            Name:
            <input
              type="text"
              name={
                selectedItem.subCategoryName
                  ? "subCategoryName"
                  : "categoryName"
              }
              value={
                updatedItem.subCategoryName
                  ? updatedItem.subCategoryName
                  : updatedItem.categoryName
              }
              onChange={handleChange}
            />
          </label>
          <label>
            Description:
            <input
              type="text"
              name={
                updatedItem.subCategoryName
                  ? "subCategoryDescription"
                  : "categoryDescription"
              }
              value={
                updatedItem.subCategoryDescription
                  ? updatedItem.subCategoryDescription
                  : updatedItem.categoryDescription
              }
              onChange={handleChange}
            />
          </label>
          <button
            onClick={() =>
              handleSubmit(
                updatedItem.subCategoryName ? "subCategoryData" : "categoryData"
              )
            }
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

export default PopupModal;
