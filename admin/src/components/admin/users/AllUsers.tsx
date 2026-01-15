import React, { useState, useEffect } from "react";
import {
  Mail,
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";
import { useAuth } from "@/hooks/useAuth";

interface User {
  uid: string;
  name: string;
  // email: string;
  username: string;
  phone_number: string;
  profile_pic: string;
  verified: number;
  register_at: string;
}

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {  accessToken, getValidAccessToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/admin/users", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.status && response.data.users) {
          setUsers(response.data.users);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getValidAccessToken]);

  if (!accessToken) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Users</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.uid}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-start p-6">
              <div className="relative mr-4">
                {user.profile_pic ? (
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                    <UseOptimizeImage
                      src={user.profile_pic}
                      alt={`${user.name}'s profile`}
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                      loading="lazy"
                      rounded="rounded-full"
                      blurBgImage="/blurPerson.png"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-gray-200">
                    <User className="h-10 w-10 text-indigo-500" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {user.verified === 1 ? (
                    <CheckCircle
                      className="text-green-500 w-6 h-6 bg-white rounded-full"
                      aria-label="Verified"
                    />
                  ) : (
                    <XCircle
                      className="text-red-500 w-6 h-6 bg-white rounded-full"
                      aria-label="Not Verified"
                    />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-indigo-600 mb-1">
                  <span className="text-sm font-medium">@{user.username}</span>
                </p>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="mr-1 text-gray-400 w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(user.register_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <Mail className="mr-3 text-indigo-400 w-5 h-5" />
                  {/* <span className="text-sm">{user.email}</span> */}
                </div>

                {user.phone_number && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="mr-3 text-indigo-400 w-5 h-5" />
                    <span className="text-sm">
                      {user.phone_number || "Not provided"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center p-10 bg-white rounded-lg shadow-md mt-4">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No users found</p>
        </div>
      )}
    </div>
  );
}
