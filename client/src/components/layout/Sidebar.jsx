import {
  LayoutGrid,
  CalendarDays,
  Heart,
  NotepadText,
  FileInput,
  UserRoundPlus,
  TextSearch,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/user-dashboard",
    },
    {
      id: 2,
      name: "Appointments",
      icon: CalendarDays,
      path: "/user-dashboard/appointment",
    },
    {
      id: 3,
      name: "Wellness",
      icon: Heart,
      path: "/user-dashboard/wellness",
    },
    {
      id: 4,
      name: "Services",
      icon: TextSearch,
      path: "/user-dashboard/services",
    },
    {
      id: 5,
      name: "Membership",
      icon: UserRoundPlus,
      path: "/user-dashboard/membership",
    },
    {
      id: 6,
      name: "Session Summary",
      icon: NotepadText,
      path: "/user-dashboard/session-summary",
    },
    {
      id: 7,
      name: "Resources",
      icon: FileInput,
      path: "/user-dashboard/resources",
    },
  ];

  return (
    <div className="w-[210px] space-y-1 p-3 bg-[#f9f7f5]">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === "/user-dashboard"}
            className={({ isActive }) =>
              `rounded-lg flex items-center gap-2.5 p-3 cursor-pointer transition-colors group ${
                isActive
                  ? "bg-[#2b2b2b] text-white hover:bg-[#3d3d3d]"
                  : "bg-transparent text-[#2b2b2b] hover:bg-[#2b2b2b] hover:text-white"
              }`
            }
          >
            <IconComponent
              size={20}
              className="transition-colors"
            />
            <h2 className="text-base font-medium transition-colors">
              {item.name}
            </h2>
          </NavLink>
        );
      })}
    </div>
  );
};

export default Sidebar;
