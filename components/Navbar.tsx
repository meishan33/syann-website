'use client'

import Link from 'next/link'
import './navbar.css'

export default function Navbar() {

  return (

    <header className="navbar">

      {/* LEFT LOGO */}
      <div className="navbar-logo">

        <Link href="/">
          SYANN
        </Link>

      </div>


      {/* CENTER MENU */}
      <nav className="navbar-links">

        <Link href="/">
          HOME
        </Link>

        <Link href="/shop">
          SHOP
        </Link>

        <Link href="/collection">
          COLLECTION
        </Link>

        <Link href="/about">
          ABOUT
        </Link>

        <Link href="/journal">
          JOURNAL
        </Link>

      </nav>


      {/* RIGHT ICONS */}
      <div className="navbar-icons">

        <button aria-label="Profile">
          ◌
        </button>

        <button aria-label="Search">
          ⌕
        </button>

        <button aria-label="Shopping Bag">
          👜
        </button>

      </div>

    </header>
  )
}
