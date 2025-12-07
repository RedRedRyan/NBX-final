"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthContext'

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header>
        <nav>
            <Link href='/' className='logo'>
                <Image src='/icons/logo.png' alt='logo' width={36} height={36}/>
                <p>NBX</p>
            </Link>

            {user ? (
                <ul>
                    <Link href='/markets'>Markets</Link>
                    <Link href='/trade'>Trade</Link>
                    <Link href='/earn'>Earn</Link>
                    <Link href='/wallet'>Wallet</Link>
                </ul>
            ) : (
                <ul>
                    <Link href='/auth/login' className="text-primary hover:text-primary/80">Login</Link>
                    <Link href='/auth/signup' className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">Get Started</Link>
                </ul>
            )}
        </nav>
    </header>
  )
}

export default Navbar
