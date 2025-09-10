'use client'

import React, { useEffect, useState } from 'react';
import LanguageSwitcher from '@/src/components/custom/common/language-switcher';
import ThemeSwitcher from "@/src/components/custom/common/theme-switcher";
import { UserDropdown } from '@/src/components/custom/common/user-dropdown';

export default function Navbar() {
    return(
        <header className="flex items-center px-4 flex-shrink-0 bg-accent justify-end py-3 shadow-sm z-40">
          <LanguageSwitcher />
          <UserDropdown />
          <ThemeSwitcher/>
        </header>
    )

}

