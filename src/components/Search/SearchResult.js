import React from "react";

const SearchResult = ({ results }) => {
  return (
    <div className="search-result">
      <h2>Search Results</h2>
      <ul>
        {results.map((payment, index) => (
          <li key={index}>{/* Display payment details */}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResult;
