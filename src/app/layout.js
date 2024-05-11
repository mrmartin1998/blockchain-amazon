'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConnectWallet from './utils/ConnectWallet';

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isActive = (href) => pathname === href ? "active-nav-item" : "";

  return (
    <html lang="en">
      <body>
        <nav className="nav-container">
          <ul className="nav-list">
            <li className={`nav-item ${isActive("/")}`}>
              <Link href="/" className="nav-link">Home</Link>
            </li>
            <li className={`nav-item ${isActive("/account-management")}`}>
              <Link href="/account-management" className="nav-link">Account Management</Link>
            </li>
            <li className={`nav-item ${isActive("/add-product")}`}>
              <Link href="/add-product" className="nav-link">Add Product</Link>
            </li>
            <li className={`nav-item ${isActive("/order-history")}`}>
              <Link href="/order-history" className="nav-link">Order History</Link>
            </li>
            <li className={`nav-item ${isActive("/administrator")}`}>
              <Link href="/administrator" className="nav-link">Administrator</Link>
            </li>
            <li className={`nav-item ${isActive("/about")}`}>
              <Link href="/about" className="nav-link">About</Link>
            </li>
          </ul>
        </nav>
        <ConnectWallet />
        {children}
        <footer className="footer">
          <p>&copy; 2024 Web3 Amazon. All rights reserved.</p>
          <p>Contact us at <a href="mailto:info@web3amazon.com">info@web3amazon.com</a></p>
        </footer>
      </body>
    </html>
  );
}
