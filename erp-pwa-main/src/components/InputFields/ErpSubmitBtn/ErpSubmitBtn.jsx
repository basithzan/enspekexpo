import React from 'react'

const ErpSubmitBtn = ({ placeholder, clickevnt }) => {
    return (
        <button
            className='my-1 py-3 bg-[#15416E] w-full text-white font-bold'
            onClick={clickevnt}
        >{placeholder}</button>
    )
}

export default ErpSubmitBtn