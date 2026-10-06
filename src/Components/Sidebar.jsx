import { NavLink } from "react-router-dom";
import {
  House,
  ListCheck,
  Calendar3,
  CheckCircle,
  BarChart,
  Tags,
  Gear,
  X
} from "react-bootstrap-icons";

function Sidebar({ onClose, isOpen }) {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <House />
    },
    {
      name: "My Tasks",
      path: "/tasks",
      icon: <ListCheck />
    },
    {
      name: "Today",
      path: "/today",
      icon: <Calendar3 />
    },
    {
      name: "Completed",
      path: "/completed",
      icon: <CheckCircle />
    },
    { name: "Analytics", path: "/analytics", icon: <BarChart /> },
    
    {
      name: "Categories",
      path: "/categories",
      icon: <Tags />
    }
  ];

  return (
    <aside className={isOpen ? "sidebar mobile-open" : "sidebar"}>

      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            ✓
          </div>

          <span>TaskFlow</span>
        </div>

        <button
          className="mobile-close"
          onClick={onClose}
        >
          <X />
        </button>
      </div>

      <nav className="sidebar-menu">

        <p className="menu-title">
          MENU
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={onClose}
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>
        ))}

        <p className="menu-title settings-title">
          SETTINGS
        </p>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link active"
              : "sidebar-link"
          }
          onClick={onClose}
        >
          <span className="sidebar-icon">
            <Gear />
          </span>

          <span>Settings</span>
        </NavLink>

      </nav>

      <div className="sidebar-footer">
        <p>TaskFlow</p>
        <small>Smart Task Management</small>
      </div>

    </aside>
  );
}

export default Sidebar;