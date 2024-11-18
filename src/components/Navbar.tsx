"use client";
import React, { useState } from "react";
import CountryDropdown from "@/widgets/CountryDropdown.widget";
import ProfileDropdown from "@/widgets/ProfileDropdown.widget";

function NavbarComponent() {
  return (
    <div className="w-full h-[5em] bg-foreground relative item-center flex px-[1.5em]">
      <div className="nav-container w-full flex justify-end">
        <div className="navbar-content flex gap-5 items-center justify-end">
          <CountryDropdown/>
          <ProfileDropdown/>
        </div>
      </div>
    </div>
  );
}

export default NavbarComponent;
