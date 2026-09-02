import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OTPVerification = ({ email, onVerified, onBack }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const { verifyOTP, sendOTP } = useAuth();

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
        startTimer();
    }, []);

    const startTimer = () => {
        setTimer(60);
        setCanResend(false);
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    };

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        if (e.key === 'Enter') {
            handleVerify();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = pastedData.split('').map(char => char.trim());
        setOtp(newOtp);
        if (newOtp.length === 6) {
            setTimeout(handleVerify, 100);
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            toast.error('Please enter complete 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await verifyOTP(email, otpCode);
            toast.success('OTP verified successfully!');
            if (onVerified) onVerified();
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await sendOTP(email);
            toast.success('OTP resent successfully!');
            startTimer();
        } catch (error) {
            // Error handled in context
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
            >
                <FaArrowLeft />
                <span>Back</span>
            </button>

            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Verify Your Email</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Enter the 6-digit OTP sent to <span className="font-medium text-blue-600">{email}</span>
                </p>
            </div>

            <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="flex items-center">
                            <div className="spinner-sm mr-2"></div>
                            Verifying...
                        </div>
                    ) : (
                        'Verify OTP'
                    )}
                </button>
            </div>

            <div className="text-center">
                <button
                    onClick={handleResend}
                    disabled={resendLoading || !canResend}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                    {resendLoading ? (
                        <span className="flex items-center justify-center">
                            <div className="spinner-sm mr-2"></div>
                            Sending...
                        </span>
                    ) : canResend ? (
                        'Resend OTP'
                    ) : (
                        `Resend OTP in ${timer}s`
                    )}
                </button>
            </div>
        </div>
    );
};

export default OTPVerification;