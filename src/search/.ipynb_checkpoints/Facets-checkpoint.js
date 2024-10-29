import React,  { useEffect } from "react";
import Tags from "./Tags";

const Facets = ({ facetsData, onFacetsChange, isSearchReset }) => {
  
  // Reset checkboxes to unchecked when a new search is initiated
  useEffect(() => {
    if (isSearchReset) {
      const checkboxes = document.querySelectorAll(".form-check-input");
      checkboxes.forEach((checkbox) => (checkbox.checked = false));
    }
  }, [isSearchReset]);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleCheckboxChange = (facet, isChecked, category) => {
    onFacetsChange(facet, isChecked, category);
  };

  const isFacetsDataEmpty =
    Object.keys(facetsData).length === 0 || Object.values(facetsData).every((value) => Object.keys(value).length === 0);

  if (isFacetsDataEmpty) {
    return null; // Don't render anything if facetsData is empty
  }

  return (
    <div className="filter-card mb-3 py-4 shadow" >
      <h3 className="filter-title">Facets</h3>
      <hr className="divider" />
      {Object.keys(facetsData).map((category) => (
        <div key={category}>
          {/* <h5 className="sub-title">{capitalizeFirstLetter(category)}</h5> */}
          <div className="facet-subtitle">
            {category==="category" &&
            <Tags
              category={capitalizeFirstLetter(category)}
              tenant=""
            />
            }
            {category==="tenant" &&
            <Tags
              category=""
              tenant={capitalizeFirstLetter(category)}
            />
            }
          </div>
          <div className="facets-grid">
            {Object.entries(facetsData[category]).map(([item, count]) => (
              <div className="form-check" key={item}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id=""
                  onChange={(e) => handleCheckboxChange(item, e.target.checked, category)}
                />
                <label className="form-check-label" htmlFor="">
                  {item} ({count})
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Facets;
