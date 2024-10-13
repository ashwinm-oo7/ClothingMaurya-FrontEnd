import React, { useState, useEffect } from "react";
import "../css/CategoryList.css"; // Import CSS file for styling
import PopupModal from "./PopupModal"; // Import the popup modal component

import { Link } from "react-router-dom";

import { FaPencilAlt, FaTrash } from "react-icons/fa"; // Import pencil icon from react-icons library

function CategoryList() {
  const [categoryData, setCategoryData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const categoryResponse = await fetch(
        process.env.REACT_APP_API_URL + "category/allCategory"
      );
      const subcategoryResponse = await fetch(
        process.env.REACT_APP_API_URL + "subcategory/allSubCategory"
      );

      if (categoryResponse.ok && subcategoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        const subcategoryData = await subcategoryResponse.json();

        // Group subcategories by category
        const groupedSubcategories = subcategoryData.reduce(
          (acc, subcategory) => {
            acc[subcategory.categoryName] = acc[subcategory.categoryName] || [];
            acc[subcategory.categoryName].push(subcategory);
            return acc;
          },
          {}
        );

        // Combine categories with their subcategories
        const combinedData = categoryData.map((category) => ({
          ...category,
          subcategories: groupedSubcategories[category.categoryName] || [],
        }));

        setCategoryData(combinedData);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleEdit = (item) => {
    // Implement edit logic here
    setSelectedItem(item);
    setIsModalOpen(true);

    console.log("Editing item:", item);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = async (_id, updatedData, param) => {
    try {
      let apirUrl = "";
      if (param === "subCategoryData") {
        apirUrl = process.env.REACT_APP_API_URL + `subcategory/update/${_id}`;
      } else if (param === "categoryData") {
        apirUrl = process.env.REACT_APP_API_URL + `category/update/${_id}`;
      }
      const response = await fetch(apirUrl, {
        method: "PUT", // Use PUT or PATCH depending on your API endpoint
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        console.log("Data updated successfully");
        setIsModalOpen(false);
        // Optionally, you can fetch updated data from the server and update the state to reflect the changes
        fetchData();
      } else {
        console.error("Failed to update data:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async (subcategory) => {
    try {
      // Send delete request to backend to delete subcategory
      const response = await fetch(
        process.env.REACT_APP_API_URL + `subcategory/delete/${subcategory._id}`,
        {
          // Use subcategory.id
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update UI by removing the deleted subcategory from the list
        setCategoryData((prevCategoryData) => {
          const updatedCategoryData = prevCategoryData.map((category) => {
            if (
              category.subcategories.some((sub) => sub._id === subcategory._id)
            ) {
              return {
                ...category,
                subcategories: category.subcategories.filter(
                  (sub) => sub._id !== subcategory._id
                ),
              };
            }
            return category;
          });
          return updatedCategoryData;
        });
        console.log("Deleted subcategory:", subcategory);
      } else {
        console.error(
          "Failed to delete subcategory already delete:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  // const confirmDelete = async () => {
  //   try {
  //     const response = await fetch(
  //       process.env.REACT_APP_API_URL + `category/delete/${selectedItem.id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       setCategoryData((prevCategoryData) =>
  //         prevCategoryData.filter((category) => category.id !== selectedItem.id)
  //       );
  //     } else {
  //       console.error("Failed to delete category:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting category:", error);
  //   }
  // };

  return (
    <div className="category-list-container">
      {categoryData.map((category) => (
        <div className="category" key={category.id}>
          <div className="category-header">
            <h1>{category.categoryName}</h1>
            <p>{category.categoryDescription}</p>
            <FaPencilAlt
              className="edit-icon"
              onClick={() => handleEdit(category)}
            />
          </div>
          <div className="subcategory-list">
            {category.subcategories.map((subcategory) => (
              <div className="subcategory" key={subcategory.id}>
                <h2>{subcategory.subCategoryName}</h2>
                <p>{subcategory.subCategoryDescription}</p>

                <FaPencilAlt
                  className="edit-icon"
                  onClick={() => handleEdit(subcategory)}
                />
                <div className="action-icons">
                  <FaTrash
                    className="delete-icon"
                    onClick={() => handleDelete(subcategory)}
                  />
                </div>
              </div>
            ))}
          </div>
          {isEditModalOpen && selectedItem && (
            <PopupModal
              selectedItem={selectedItem}
              handleCloseModal={() => setIsEditModalOpen(false)}
              handleUpdate={handleUpdate}
            />
          )}

          {/* {isDeleteConfirmationOpen && selectedItem && (
                <ConfirmationModal
                    message={`Are you sure you want to delete the category '${selectedItem.categoryName}'?`}
                    handleConfirm={confirmDelete}
                    handleCancel={cancelDelete}
                />
            )} */}
        </div>
      ))}
      {isModalOpen && selectedItem && (
        <PopupModal
          selectedItem={selectedItem}
          handleCloseModal={handleCloseModal}
          handleUpdate={handleUpdate}
        />
      )}
      <p className="next-subcategory">
        <Link to="/subcategories">Back</Link>
      </p>
    </div>
  );
}

export default CategoryList;
