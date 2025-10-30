import React from 'react'

const ErpTextArea = ({ placeholder }) => {
    return (
        <div className='px-5 py-2'>
            <textarea className='w-full border border-[#E2E8F0] rounded-lg px-3 py-4' rows={3} placeholder={placeholder} name="" id="" />
        </div>
    )
}

export default ErpTextArea