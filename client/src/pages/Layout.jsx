import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../api/axios.js";
import { toast } from "react-hot-toast";

const Layout = () => {
  const { getToken } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken(); // ✅ must await
        const { data } = await api.get("/api/user/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setUser(data.user);
        } else {
          toast.error(data.message || "Failed to load user");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [getToken]); // ✅ only depends on getToken function

  return user ? (
    <div className="w-full fixed inset-0 overflow-y-scroll overflow-x-scroll bg-slate-50 flex min-h-screen">
      <div className="w-64 p-0">
        <Sidebar />
      </div>
      <div className="relative flex-1 px-6 py-2">
        <Outlet />
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
