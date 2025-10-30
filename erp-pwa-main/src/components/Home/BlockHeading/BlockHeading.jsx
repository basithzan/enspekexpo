import React from 'react'
import { Link } from 'react-router-dom'

const BlockHeading = ({ title, route }) => {
  return (
    <div className='flex justify-between text-lg mb-3'>
      <div className='font-bold text-[#0F172A]'>{title}</div>
      {/* <Link to={route} className='text-[#15416E] font-medium'>See all</Link> */}
    </div>
  )
}

export default BlockHeading