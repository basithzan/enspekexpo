import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BlockHeading = ({ title, route, link_label = "View all" }) => {
  const navigate = useNavigate();

  const handleNavigate = (event) => {
    if (!route) return;
    // Allow standard link behavior for new tabs etc.
    if (event.metaKey || event.ctrlKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    navigate(route);
  };

  return (
    <div className='flex justify-between text-lg mb-3'>
      <div className='font-bold text-[#0F172A]'>{title}</div>
      {route && (
        <Link
          to={route}
          onClick={handleNavigate}
          className='text-[#15416E] font-medium'
        >
          {link_label}
        </Link>
      )}
    </div>
  )
}

export default BlockHeading