import React from 'react'

const StatusCount = ({statusName, count, countDesc, totalCount, totalCountDesc}) => {
  return (
    <div className='bg-[#DBEDFF]/80 border border-[#E2E8F0] px-3 py-4 aspect-square rounded-xl flex flex-col justify-between items-center'>
        <div className='text-[#15416E] font-bold text-sm'>{statusName}</div>
        
        <div className='text-[#15416E] text-center'>
            <div className='font-bold text-3xl leading-none mb-1.5'>{count}</div>
            <div className='font-medium leading-none'>{countDesc}</div>
        </div>

        <div className='flex text-[#8B9197] text-xs font-medium'>
            <div>{totalCountDesc}</div>:&nbsp;<div>{totalCount}</div>
        </div>
    </div>
  )
}

export default StatusCount