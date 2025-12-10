import React from "react";
import { Link } from "react-router-dom";
import Layout from "../layout";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

const HeadHero = () => {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/"); // điều hướng về trang chủ sau khi logout
  };
  return (
    <Layout>
      <div className="justify-between w-full lg:flex lg:gap-x-3">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">QuizWhiz</span>
            <img
              className="w-auto h-8"
              src="/images/logo.jpg"
              alt="QuizWhiz Logo"
              width="161"
              height="32"
            />
          </Link>

          {/* For Institutions */}
          <div className="flex items-center gap-x-2 lg:gap-x-3">
            <Button
              className="rounded-xl text-pink-600 bg-white border-[1px] border-pink-600 hover:bg-pink-600 hover:text-white font-bold"
              size="sm"
            >
              For Institutions
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="hidden size-4 sm:block"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </Button>

            {/* Log in */}
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                className="font-bold text-black bg-white hover:text-white hover:bg-black border-[1px] border-black rounded-xl"
                size="sm"
              >
                Log out
              </Button>
            ) : (
              <Button
                className="font-bold text-black bg-white hover:text-white hover:bg-black border-[1px] border-black rounded-xl"
                size="sm"
              >
                <Link to="/login">Log in</Link>{" "}
                <span aria-hidden="true" className="hidden sm:block">
                  →
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HeadHero;
