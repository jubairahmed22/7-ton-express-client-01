"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function CustomerSidebar({ isCollapsed, toggleSidebar }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Initialize ALL submenus as closed (empty object)
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Automatically open the submenu if the current path matches
  useEffect(() => {
    const navItems = [
      {
        name: "International",
        submenu: [
          { href: "/international/add-shipment" },
          { href: "/international/all-shipments" },
          { href: "/international/calculate-shipping" },
          { href: "/international/shipping-calculator" },
          { href: "/international/pre-alert" },
        ],
      },
      {
        name: "Domestic",
        submenu: [
          { href: "/domestic/all-shipment" },
          { href: "/domestic/add-shipment" },
          { href: "/domestic/all-order" },
          { href: "/domestic/shipping-calculator" },
        ],
      },
      {
        name: "Users",
        submenu: [
          { href: "/users/vendors" },
          { href: "/users/customers" },
          { href: "/users/admin" },
        ],
      },
      {
        name: "Configurations",
        submenu: [
          { href: "/configurations/cities" },
          { href: "/configurations/domestic" },
          { href: "/configurations/international" },
          { href: "/configurations/currencies" },
        ],
      },
    ];

    // Find which menu item should be open based on current path
    const activeMenu = navItems.find(item => 
      item.submenu?.some(subItem => pathname.startsWith(subItem.href))
      ?.name)

    // If found, open that menu
    if (activeMenu) {
      setOpenSubmenus({ [activeMenu]: true });
    }
  }, [pathname]);

  // Toggle ONLY the clicked submenu (others stay closed)
  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...Object.keys(prev).reduce((acc, key) => {
        acc[key] = false; // Close all other menus
        return acc;
      }, {}),
      [menuName]: !prev[menuName] // Toggle only the clicked menu
    }));
  };

  const navItems = [
    {
      name: "International",
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      submenu: [
        { name: "Add Shipment", href: "/international/add-shipment" },
        { name: "All Shipment List", href: "/international/all-shipments" },
        {
          name: "Calculate Shipping",
          href: "/international/calculate-shipping",
        },
        {
          name: "Shipping Calculator",
          href: "/international/shipping-calculator",
        },
        { name: "Pre Alert", href: "/international/pre-alert" },
      ],
    },
    {
      name: "Domestic",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      submenu: [
        { name: "All Shipment", href: "/domestic/all-shipment" },
        { name: "Add Shipment", href: "/domestic/add-shipment" },
        { name: "All Order", href: "/domestic/all-order" },
        { name: "Shipping Calculator", href: "/domestic/shipping-calculator" },
      ],
    },
    {
      name: "Users",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      submenu: [
        { name: "Vendors", href: "/users/vendors" },
        { name: "Customers", href: "/users/customers" },
        { name: "Admin", href: "/users/admin" },
      ],
    },
    {
      name: "Invoices",
      icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z",
      href: "/invoices",
    },
    {
      name: "Missions",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      href: "/missions",
    },
    {
      name: "Configurations",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      submenu: [
        { name: "Cities", href: "/configurations/cities" },
        { name: "Domestic", href: "/configurations/domestic" },
        { name: "International", href: "/configurations/international" },
        { name: "Currencies", href: "/configurations/currencies" },
      ],
    },
    {
      name: "Warehouses",
      icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
      href: "/warehouses",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      toggleSidebar();
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button with fixed position */}
      {isMobile && (
        <button
          onClick={handleToggle}
          className="fixed z-50 left-4 font-semibold text-gray-600 top-4 p-2 rounded-md bg-white shadow-md md:hidden transition-all duration-300 hover:bg-gray-100"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="h-6 w-6 transform transition-transform duration-300"
            style={{
              transform: isMobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      )}

      {/* Sidebar with z-20 */}
      <div
        className={`fixed z-20 border-r border-r-gray-200 fontPoppins h-full bg-white text-black shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        } ${isMobile && !isMobileMenuOpen ? "-left-full md:left-0" : "left-0"}`}
      >
        {/* Sidebar header with animation */}
        <div className="p-4 flex items-center justify-center overflow-hidden h-20 border-b border-gray-200">
          <h2
            className={`text-2xl font-bold whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            7tonexpress
          </h2>
        </div>

        {/* Navigation items */}
        {/* <nav className="mt-6 overflow-y-auto h-[calc(100vh-80px)]">
          {navItems.map((item, index) => (
            <div key={item.name} className="mb-1 mx-2">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex rounded-lg font-semibold text-gray-600 hover:text-black cursor-pointer items-center w-full px-4 py-3 transition-all duration-300 hover:bg-gray-100 ${
                      pathname.startsWith(`/${item.name.toLowerCase()}`)
                        ? "bg-gray-100"
                        : ""
                    } ${
                      isCollapsed ? "px-0 justify-center" : "justify-between"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 min-w-[20px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={item.icon}
                        />
                      </svg>
                      <span
                        className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                          isCollapsed
                            ? "opacity-0 w-0 overflow-hidden"
                            : "opacity-100 w-auto"
                        }`}
                        style={{
                          transitionDelay: isCollapsed
                            ? "0ms"
                            : `${index * 50}ms`,
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <svg
                        className={`h-4 w-4 transform transition-transform duration-200 ${
                          openSubmenus[item.name] ? "rotate-90" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSubmenus[item.name] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={handleLinkClick}
                        className={`flex items-center rounded-lg mx-2 text-gray-700 hover:text-black py-3 px-4 pl-12 text-sm transition-all duration-300 ${
                          pathname === subItem.href
                            ? "bg-gray-100 font-medium"
                            : "hover:bg-gray-50"
                        } ${
                          isCollapsed ? "px-0 justify-center" : "justify-start"
                        }`}
                      >
                        <span
                          className={`whitespace-nowrap transition-all duration-300 ${
                            isCollapsed
                              ? "opacity-0 w-0 overflow-hidden"
                              : "opacity-100 w-auto"
                          }`}
                        >
                          {subItem.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex w-full justify-start items-center font-semibold rounded-lg text-gray-600 hover:text-black md:justify-start px-4 py-3 transition-all duration-300 ${
                    pathname === item.href ? "bg-gray-100" : "hover:bg-gray-100"
                  } ${isCollapsed ? "px-0" : ""}`}
                  title={isCollapsed ? item.name : ""}
                >
                  <div
                    className={`flex items-center ${
                      isCollapsed ? "justify-center w-full" : ""
                    }`}
                  >
                    <svg
                      className="h-5 w-5 min-w-[20px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={item.icon}
                      />
                    </svg>
                    <span
                      className={`ml-3 whitespace-nowrap flex justify-start transition-all duration-300 ${
                        isCollapsed
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100 w-auto"
                      }`}
                      style={{
                        transitionDelay: isCollapsed
                          ? "0ms"
                          : `${index * 50}ms`,
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </nav> */}
      </div>
    </>
  );
}