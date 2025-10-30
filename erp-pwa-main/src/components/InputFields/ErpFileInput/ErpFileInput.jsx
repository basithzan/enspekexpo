import React from 'react'

const ErpFileInput = ({ placeholder }) => {
    return (
        <div className='px-5 py-2'>
            <label>
                <input type="file" name="" id="" className='hidden' />
                <div className='border border-[#E2E8F0] rounded-lg p-2 text-gray-400 flex items-center gap-3' name="" id="">
                    <div className='inline px-5 py-1 font-medium text-white text-2xl bg-[#D9D9D9] rounded-lg'>+</div>
                    <div>{placeholder}</div>
                </div>
            </label>
        </div>
    )
}

export default ErpFileInput