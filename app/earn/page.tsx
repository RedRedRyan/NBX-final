"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { earnOptions } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';
import Image from "next/image";

const EarnPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Earn</h1>
        <p className="text-light-100">Grow your assets with NBX earning options</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {earnOptions.map((option) => (
          <Link 
            href={`/earn/${option.id}`} 
            key={option.id}
            className="bg-dark-100 border border-border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <div className=" rounded-full flex items-center justify-center mb-4">
              <Image src={option.img} alt='fixed funding' width={160} height={160}/>
            </div>
            
            <h2 className="text-xl font-bold mb-2">{option.label}</h2>
            <p className="text-light-100 mb-4">{option.description}</p>
            
            {option.apy && (
              <div className="bg-dark-200 rounded-md p-3 mb-4">
                <span className="text-primary font-bold">{option.apy}</span>
              </div>
            )}
            
            {option.reward && (
              <div className="bg-dark-200 rounded-md p-3 mb-4">
                <span className="text-primary font-bold">{option.reward}</span>
              </div>
            )}
            
            <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90">
              Get Started
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EarnPage;