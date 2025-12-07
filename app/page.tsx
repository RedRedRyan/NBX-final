// import Image from 'next/image'
import Link from 'next/link'
import { companies, partners, features } from '@/lib/constants'


const HomePage = () => {
  // Get top companies (those marked as hot or with highest positive change)
  const topCompanies = companies
    .filter(company => company.isHot || company.change24h > 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 6);

  return (
    <section id="hero">

      <div>
      </div>

    
      {/* Hero Section */}
      <div className="top-grid">
        {/* First Row*/}
                <div className="md:col-span-3">
                    <div  className="noisy" />
                    <img src="/images/obzebra.png" alt="grid-img-5 " />
                    
                </div>

                <div className="md:col-span-9">
                    <div  className="noisy" />
                    <h1 className="text-6xl font-bold mt-10 text-center">Invest in Kenya</h1>
                    <p className='text-center mt-4 font-mono text-lg'>Company shares as security tokens</p>
                    <div className='flex justify-center gap-4 lg:mt-8 md:mt-4'>
                      <a href='/auth/signup' className="bg-accent-foreground badge">Sign Up</a>
                    <a href='/auth/login' className="badge">Log In</a>
                    </div>
                    
                </div>
              {/* 2nd Row */}


                <div className="md:col-span-2">
                    <div  className="" />
                    <h1 className='text-5xl mt-16 text-primary'>
                    From<br/>Anywhere
                    </h1>
                   
                    
                </div>
                <div className="md:col-span-7 bg-transparent ">
                    <div  className="noisy " />
                    <img src="/icons/mapbase.svg" alt="grid-img-5  " className=''/>
                    <p>NBX democratizes investing by turning company shares into security tokens</p>
                    
                    
                    
                    
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
                <h2 className="text-6xl font-bold mt-12">Big Six</h2>
                <p className='mt-4'> The 6 promising Companies</p>

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
        <div id='temp' className="md:col-span-5 text-center">
                    
                   <h1 className='text-center'>The</h1> 
                </div>
                <div id='tempy' className="md:col-span-5">
                    
                    <h1 className='text-center'>Next</h1>
                </div>
                <div id='tempy' className="md:col-span-10">
                    
                <h1 className='text-center'>Step</h1>
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
                {/* Partner logo would go here */}
                <span className="text-sm font-medium text-light-100">{partner.name.split(' ').map(word => word[0]).join('')}</span>
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
