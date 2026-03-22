import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${assets.bgImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      className="h-[100vh] flex flex-col md:flex-row "
    >
      {/* left side  */}
      <div className="flex-1 flex flex-col items-start justify-between   p-6 md:p-10 lg:pl-40 pb-15">
        <img src={assets.logo} className="h-12 "></img>
        <div className="">
          <div className="flex items-center gap-3 mb-4 max-md:mt-10 ">
            <img src={assets.group_users} className="h-8 md:h-10"></img>
            <div className="flex flex-col items-start justify-start">
              <div className="flex items-center justify-start gap-1">
                {Array(5)
                  .fill(0)
                  .map((itm) => (
                    <Star className="fill-amber-500 size-4 md:size-4.5 text-transparent" />
                  ))}
              </div>
              <p className="text-sm sm:text-sm">Used by 12k+ developers</p>
            </div>
          </div>

          <p className="text-3xl md:text-6xl md:pb-2 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
            More than just friends truly connect
          </p>

          <p className="text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md">
            connect with global community on pingup.
          </p>
        </div>
        <span className="md:h-10"></span>
      </div>

      {/*---------- Right Side  ---------- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <SignIn />
      </div>
    </div>
  );
};

export default Login;
