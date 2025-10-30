import React from 'react'

function BidStatusDetail() {
  return (
    <div>
      <div className="border rounded-xl px-4 mx-5 py-2 mt-3 align-right m-3">
      <div className="text-xl font-semibold">Job Details</div>
      <div className="grow">
        <div className="text-base">Job Budget:</div>
        <div className="text-xs text-[#535354]">Hourly Rate - Target price was not specified.</div><hr />
        <div className="text-base">Type:</div>
        <div className="text-xs text-[#535354]">Pre-Shipment Inspection</div><hr />
        <div className="text-base">Category:</div>
        <div className="text-xs text-[#535354]">Food</div><hr />
        <div className="text-base">Group:</div>
        <div className="text-xs text-[#535354]">Test inspection 1</div><hr />
      </div>
      </div>
    </div>
  )
}

export default BidStatusDetail
