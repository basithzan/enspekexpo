import React from 'react'
import TopBar from '../../components/TopBar/TopBar'
import JobBlock from '../../components/Home/JobBlock/JobBlock'
import TabNavigatorClient from '../../components/TabNavigatorClient'
import TabNavigatorInspector from '../../components/TabNavigatorInspector'

const JobsNearMe = () => {
    return (
        <>
            <TopBar title={'Jobs Near Me'} show_back />
            <div className="grid gap-3 px-5 pb-20">
                <JobBlock
                    category={'Industrial'}
                    title={'Dubai Pre-Shipment Inspection'}
                    location={'Dubai, UAE'}
                    date={'Jan 16, 23'}
                    tag={'Extensive Quality Audit'}
                />
                <JobBlock
                    category={'Industrial'}
                    title={'Dubai Pre-Shipment Inspection'}
                    location={'Dubai, UAE'}
                    date={'Jan 16, 23'}
                    tag={'Extensive Quality Audit'}
                />
                <JobBlock
                    category={'Industrial'}
                    title={'Dubai Pre-Shipment Inspection'}
                    location={'Dubai, UAE'}
                    date={'Jan 16, 23'}
                    tag={'Extensive Quality Audit'}
                />
                <JobBlock
                    category={'Industrial'}
                    title={'Dubai Pre-Shipment Inspection'}
                    location={'Dubai, UAE'}
                    date={'Jan 16, 23'}
                    tag={'Extensive Quality Audit'}
                />
            </div>
            <TabNavigatorInspector current={''} />
        </>
    )
}

export default JobsNearMe