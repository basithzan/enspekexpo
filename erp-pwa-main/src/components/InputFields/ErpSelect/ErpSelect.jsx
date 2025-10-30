import React from 'react'

const ErpSelect = ({ placeholder }) => {
    return (
        <select className='border border-gray-300 rounded-lg px-4 py-2 text-[#94A3B8]'>
            <option value="">{placeholder}</option>
        </select>
    )
}

export default ErpSelect