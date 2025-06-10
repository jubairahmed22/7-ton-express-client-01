"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  console.log("token", session);

  if (status === "loading") {
    return <div className="bg-white p-4">Loading...</div>;
  }

  return (
    <nav className="bg-white font-semibold fontPoppins dark:bg-white sticky w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 shadow-sm">
      <div className="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          /> */}
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            7tonexpress
          </span>
        </a>

        <div className="flex md:order-2  space-x-3 md:space-x-0 rtl:space-x-reverse items-center">
          {status === "authenticated" ? (
            <div className="flex items-center space-x-4">
              <span className=" md:inline text-gray-700 dark:text-gray-300 font-medium">
                {session?.user?.name || session?.user?.email} asdgaf
              </span>
              <div className=" md:flex space-x-4">
                {session?.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="
    inline-flex items-center font-semibold
    bg-white text-gray-800 dark:text-gray-900
     py-2.5 px-4 rounded-lg
    border border-gray-200 dark:border-gray-600
    shadow-sm hover:shadow-md
    transition-all duration-200
    hover:bg-gray-50 dark:hover:bg-gray-100
    active:bg-gray-100 dark:active:bg-gray-200
    focus:outline-none focus:ring-2 focus:ring-blue-500/30
    gap-2
  "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="
    inline-flex items-center
    bg-white text-gray-800 dark:text-gray-900
    font-semibold py-2.5 px-4 rounded-lg
    border border-gray-200 dark:border-gray-600
    shadow-sm hover:shadow-md
    transition-all duration-200
    hover:bg-gray-50 dark:hover:bg-gray-100
    active:bg-gray-100 dark:active:bg-gray-200
    focus:outline-none focus:ring-2 focus:ring-blue-500/30
    gap-2
  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                  </svg>
                  <span>Customer</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
              >
                Register
              </Link>
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

        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-white dark:border-gray-700">
            <li>
              <a
                href="/"
                className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent aria-[current=page]:text-blue-700 aria-[current=page]:dark:text-blue-400"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent aria-[current=page]:text-blue-700 aria-[current=page]:dark:text-blue-400"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/services"
                className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent aria-[current=page]:text-blue-700 aria-[current=page]:dark:text-blue-400"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent aria-[current=page]:text-blue-700 aria-[current=page]:dark:text-blue-400"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
