import React, { useState } from 'react'
import TopBar from '../../components/TopBar/TopBar'
import { Link } from 'react-router-dom'
import OtpInput from 'react-otp-input';

const VerifyAccount = () => {
    const [otp, setOtp] = useState('');
    return (
        <>
            <TopBar show_back />

            <div className="font-bold text-lg mb-2.5 px-4">Verify Account</div>
            <div className="px-5">
                <div className="text-black/40 text-center font-medium text-sm mt-8">Enter the code or click on the link received via SMS, to <div className='text-black inline'>confirm your account.</div></div>
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    renderSeparator={<span className='text-[#CCCCCC]'>-</span>}
                    containerStyle={'!grid grid-cols-11 place-items-center mt-10'}
                    inputStyle={'border border-[#CCCCCC] !w-full col-span-2 py-2 rounded-xl'}
                    renderInput={(props) => <input {...props} />}
                />
                <div className="text-black/40 font-medium text-sm my-10">Didn’t receive? <a className='text-[#15416E] inline'>Resend code</a></div>
                <Link to={'/verify-account'} className='text-center px-5 py-3 bg-[#15416E] mx-auto block rounded-full text-white'>Login Now</Link>
            </div>

        </>
    )
}

export default VerifyAccount