import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function Search(props) {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      const searchQuery = searchInput.toLowerCase().trim();

      // Use navigate to change the URL without reloading the page
      navigate(`/search-results?query=${searchQuery}`);
    }
  };

  return (
    <input
      style={{
        borderRadius: "30px",
        width: "400px",
        marginLeft: "20px",
        backgroundColor: "white",
      }}
      type="text"
      placeholder="Search type then press enter"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      onKeyPress={handleSearchKeyPress}
    />
  );
}
