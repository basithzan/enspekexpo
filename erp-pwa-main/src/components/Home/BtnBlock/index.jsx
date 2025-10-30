import React from 'react'
import { Link } from 'react-router-dom'

const BtnBlock = ({ title, link }) => {
    return (
        <div className="mx-5">
            <Link to={link} className='my-6 border border-[#B7BBBF] rounded-2xl w-full flex flex-col items-center justify-center gap-2 py-8 text-xl font-medium'>
                <div>+</div>
                <div>{title}</div>
            </Link>
        </div>
    )
}

export default BtnBlock