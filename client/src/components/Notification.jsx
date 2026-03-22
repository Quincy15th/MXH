import React from "react";
import { useNavigate } from "react-router-dom";

const Notification = ({ t, message }) => {
  const navigate = useNavigate();
  return (
    <div
      className={`max-w-md w-full bg-white shadow-lg rounded-lg  flex border border-gray-300 hover:scale-105 transition`}
    >
      <div className="flex-1 p-4">
        <div className="flex items-start ">
          <img src={message.from_user_id.profile_picture} className=""></img>
        </div>
      </div>
    </div>
  );
};

export default Notification;
