import React, { useState } from "react";
import { assets, menuItemsData } from "../assets/assets";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { CirclePlus, LogOut, Menu, X } from "lucide-react";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const navigate = useNavigate();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const { openUserProfile, signOut } = useClerk();
  const user = useSelector((state) => state.user.value);

  // Menu items
  const renderMenuItems = () => (
    <div className="w-full flex flex-col gap-3 items-center mt-6">
      {menuItemsData.map((itm, idx) => (
        <NavLink
          key={idx}
          to={itm.to}
          className={({ isActive }) =>
            `w-[85%] py-2 rounded-sm flex items-center justify-start gap-2 pl-3 transition-colors ${
              isActive
                ? "bg-[#EEF2FF] text-[#432DD7]"
                : "text-gray-600 hover:bg-[#EEF2FF]"
            }`
          }
          onClick={() => setSideBarOpen(false)} // close on mobile click
        >
          <itm.Icon className="w-5 h-5" />
          {itm.label}
        </NavLink>
      ))}
    </div>
  );

  // Profile section
  const renderProfileSection = () => (
    <div className="w-full flex items-center gap-3 p-4 border-t border-gray-200 pb-6 mb-3 relative">
      <UserButton />
      <div className="flex flex-col items-start">
        <p className="font-semibold text-gray-700 text-sm">
          {user?.full_name || "Loading..."} {/* ✅ safe access */}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={openUserProfile}
          className="cursor-pointer text-xs text-gray-500 hover:text-[#432DD7] transition"
        >
          View Profile
        </motion.button>
      </div>

      <LogOut
        onClick={signOut}
        size={20}
        className="text-gray-500 cursor-pointer absolute right-5"
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="bg-white z-30 hidden sm:flex flex-col fixed left-0 inset-y-0 sm:w-64 w-0 shadow shadow-gray-300">
        {/* Top Section */}
        <div className="flex flex-col flex-1">
          <div className="w-full border-b border-gray-300 py-3 pl-4">
            <motion.img
              onClick={() => navigate("/")}
              whileTap={{ scale: 0.96 }}
              src={assets.logo}
              className="w-28 cursor-pointer"
            />
          </div>

          {renderMenuItems()}

          <div
            onClick={() => navigate("/create-post")}
            className="w-[85%] mx-auto mt-10 py-2 text-white flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#615FFF] to-[#9810FA] cursor-pointer hover:opacity-90 transition"
          >
            <CirclePlus />
            Create Post
          </div>
        </div>

        {/* Bottom Section */}
        {renderProfileSection()}
      </div>

      {/* Mobile Sidebar Toggle */}
      {!sideBarOpen && (
        <div className="block sm:hidden fixed top-3 right-5 z-20">
          <div
            onClick={() => setSideBarOpen(true)}
            className="cursor-pointer rounded-sm border-2 border-gray-600 flex items-center justify-center p-1 backdrop-blur-xs"
          >
            <Menu />
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {sideBarOpen && (
        <div className="absolute block sm:hidden inset-0 z-30 bg-white shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300">
            <motion.img
              onClick={() => navigate("/")}
              whileTap={{ scale: 0.96 }}
              src={assets.logo}
              className="w-24 cursor-pointer"
            />
            <X
              onClick={() => setSideBarOpen(false)}
              className="w-6 h-6 cursor-pointer text-gray-700"
            />
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto">{renderMenuItems()}</div>

          {/* Bottom Profile */}
          {renderProfileSection()}
        </div>
      )}
    </>
  );
};

export default Sidebar;
