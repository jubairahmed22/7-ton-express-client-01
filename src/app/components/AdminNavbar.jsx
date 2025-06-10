"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import '../../styles/adminLayout.css'

export default function AdminNavbar() {
  const { data: session, status } = useSession();

  console.log("token", session);

  if (status === "loading") {
    return <div className="bg-white p-4">Loading...</div>;
  }

  return (
    <nav className="bg-white h-20 fontPoppins font-semibold  dark:bg-white sticky w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-7">
        {/* <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Flowbite
          </span>
        </a> */}

        <div className="flex md:order-2  space-x-3 md:space-x-0 rtl:space-x-reverse items-center">
          {status === "authenticated" ? (
            <div className="flex items-center space-x-4">
              <span className=" md:inline text-gray-700 dark:text-gray-300 font-medium">
                {session?.user?.email} 
              </span>
              <div className=" md:flex space-x-4">
              
               
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-700 cursor-pointer dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className=" md:flex space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-md"
              >
                Login
              </Link>
              {/* <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
              >
                Register
              </Link> */}
            </div>
          )}

          {/* <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button> */}
        </div>

       <div></div>
      </div>
    </nav>
  );
}
