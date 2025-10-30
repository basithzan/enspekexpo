import React from 'react'
import caretDIco from "../../../assets/image/icons/caret-down.svg";
import StatusCount from '../../../components/Home/StatusCount/StatusCount';
import { useSelector } from 'react-redux';

const DashboardBlockContainer = () => {

  const inspector = useSelector((state) => state.inspector.auth_inspector);

  return (
    <div className='mx-5 py-4'>
      {/* <div className='flex justify-end'>
        <a href="#" className='text-[#15416E] text-sm font-bold flex gap-2'>
          This Week
          <img src={caretDIco} alt="" />
        </a>
      </div> */}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <StatusCount
          statusName='Completed'
          count={inspector?.user?.completedCount}
          countDesc='Completed Jobs'
          totalCount={inspector?.user?.completedCount}
          totalCountDesc='Total Completed'
        />
        <StatusCount
          statusName='Rejected'
          count={inspector?.user?.rejectedCount}
          countDesc='Jobs'
          totalCount={inspector?.user?.rejectedCount}
          totalCountDesc='Total Rejected'
        />
        <StatusCount
          statusName='Work in progress'
          count={inspector?.user?.acceptedCount}
          countDesc='Jobs'
          totalCount={inspector?.user?.acceptedCount}
          totalCountDesc='Total Jobs'
        />
        <StatusCount
          statusName='Bids'
          count={inspector?.user?.appliedCount}
          countDesc='Bids'
          totalCount={inspector?.user?.appliedCount}
          totalCountDesc='Total Bid'
        />
      </div>

    </div>
  )
}

export default DashboardBlockContainer