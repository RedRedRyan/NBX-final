// import Image from 'next/image'
"use client";
import Link from 'next/link'
import { companies, partners, features } from '@/lib/constants'
import { useAuth } from '@/lib/context/AuthContext'
import ParticlesBackground from '@/components/ParticlesBackground'


const HomePage = () => {
  const { isAuthenticated } = useAuth()
  // Get top companies (those marked as hot or with highest positive change)
  const topCompanies = companies
    .filter(company => company.isHot || company.change24h > 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 6);

  const tickerItems = [...companies, ...companies];

  return (
    <section id="hero" className="relative overflow-hidden">

      <div>
      </div>

    
      {/* Hero Section */}
      <ParticlesBackground />
      <div className="ticker">
        <div className="ticker-track">
          {tickerItems.map((company, index) => {
            const isPositive = company.change24h >= 0;
            const formattedChange = `${isPositive ? "+" : ""}${company.change24h}%`;

            return (
              <div key={`${company.symbol}-${index}`} className="ticker-item">
                <span className="symbol">{company.symbol}</span>
                <span className="price">{company.price.toFixed(2)} KES</span>
                <span className={isPositive ? "change-positive" : "change-negative"}>{formattedChange}</span>
              </div>
            );
          })}
        </div>
      </div>

  <div className="top-grid mt-24">
        {/* First Row*/}
                <div className="md:col-span-9">
                    <div  className="noisy" />
                    <h1 className="text-6xl font-bold mt-10 text-center">Invest in Kenya</h1>
                    <p className='text-center mt-4 font-mono text-lg'>SME capital markets redefined</p>
                    <div className='flex justify-center gap-4 lg:mt-8 md:mt-4'>
                      {isAuthenticated ? (
                        <>
                          <a href='/markets' className="bg-accent-foreground badge">Explore Markets</a>
                          <a href='/wallet' className="badge">Portfolio</a>
                        </>
                      ) : (
                        <>
                          <a href='/auth/signup' className="bg-accent-foreground badge">Sign Up</a>
                          <a href='/auth/login' className="badge">Log In</a>
                        </>
                      )}
                    </div>
                    
                </div>
                 <div className="md:col-span-3">
                  {/**image mode cover so the image is not cropped when screen */}
                    <div  className="noisy" />
                    <img src="/images/obzebra.png" alt="grid-img-5" style={{ objectFit: "contain" }} />
                    
                </div>
              {/* 2nd Row */}

                <div className="md:col-span-9 bg-transparent ">
                    <div  className="noisy " />
                    <img src="/icons/mapbase.svg" alt="grid-img-5  " className='' />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                      <h2 id="AnyText" >
                        Anywhere Anytime
                      </h2>
                      <p className="max-w-lg text-white">
                        NBX democratizes investing by turning company shares into security tokens
                      </p>
                    </div>
                </div>
                <div className="md:col-span-3 hover:bg-primary hover:text-black transition-all duration-300 ease-in-out rounded-lg p-6">
                    <div  className="lg:mt-14 lg:text-2xl md:text-2xl text-center">
                        <ul>
                        <li>
                              Fractional ownerships
                              </li>
                          <li>
                            Instant Settlements
                          </li>
                          <li>
                            Borderless investment
                            </li>
                            
                        </ul>
                    </div>

                </div>

                    

      </div>
                    {/* Features Grid - Each feature is now a direct child of the grid */}
                    <div className="middle-grid">
        {features.map((feature: { icon: string; title: string; description: string }, index: number) => (
          <div key={index} className="md:col-span-3">
            <div className="feature-card p-6 backdrop-brightness-50 rounded-lg border border-primary h-full">
              <div className="feature-icon">
                <img src={feature.icon || "/placeholder.svg"} alt={feature.title} className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>



            <div className="bigsix-grid">

              <div className='md:col-span-6 text-center '>
                <h2 className="text-6xl font-bold mt-12">SMEs Big Six</h2>
                <p className='mt-4'> An index of the 6 most promising companies</p>

              </div>
            {topCompanies.map((company) => (
              <div key={company.symbol} className=" border-t-3 border-white rounded-lg p-4 flex items-center md:col-span-3"
              style={{ backgroundColor: company.bgColor }}>
                <div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                {/* Company icon would go here */}
                <span className="text-xl font-bold">{company.symbol.charAt(0)}</span>
              </div>

              <div className="flex-1  ">
                <h3 className="font-bold text-white">{company.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">{company.symbol}</span>
                  <span className={`text-sm ${company.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {company.change24h >= 0 ? '+' : ''}{company.change24h}%
                  </span>
                </div>
              </div>
              </div>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="badge ml-auto">See</a>
            </div>
            
          ))}
      </div>
      <div className="bottom-grid">
        <div className="md:col-span-12 flex flex-col items-center justify-center text-center">
          <h2 id='AnyText' >Together lets take SMEs to</h2><br/>
          <h1 className='text-center'>The Next Step</h1>
        </div>
      </div>

      {/* Top Companies Section */}
            <div className="flex flex-col items-center">
      

      {/* Partners Section */}
      <div className="w-full max-w-5xl mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Partners</h2>

        <div className="flex flex-wrap justify-center gap-8">
          {partners.map((partner) => (
            <div key={partner.name} className="text-center">
              <div className="w-24 h-24 bg-dark-200 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <img alt={partner.name} src={partner.logo}/>
                {/* To do get Partner logo */}
              </div>
              <p className="text-sm text-light-100">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </section>
  )
}

export default HomePage
