import React from 'react';
import { GoSidebarExpand, GoSidebarCollapse } from 'react-icons/go';

const ToggleSidebar = ({ toggleIcon, isSidebarExpanded }) => {
  return (
    <div
      className="toggle-sidebar-button"
      onClick={toggleIcon}
    >
      {isSidebarExpanded ? <GoSidebarExpand size={26} /> : <GoSidebarCollapse size={26} />}
    </div>
  );
};

export default ToggleSidebar;
