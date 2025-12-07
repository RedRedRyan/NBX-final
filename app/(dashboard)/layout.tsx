import React from 'react'

const Layout = ({children}:{children: React.ReactNode}) => {
    return (
        <div className="p-6">
            {children}
        </div>
    )
}

export default Layout
