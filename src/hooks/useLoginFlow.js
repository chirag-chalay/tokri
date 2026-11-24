import { useState } from 'react'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { postJson } from '../lib/api'
import { trackRegistration } from '../lib/telemetry'

export function useLoginFlow({ onSuccess }) {
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const validateMobile = () => /^\d{10}$/.test(mobileNumber)
  const canContinue = validateMobile() && !loading

  const reset = () => {
    setStep(1)
    setMobileNumber('')
    setOtp('')
    setLoading(false)
  }

  const handleContinue = async () => {
    if (!validateMobile()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid number',
        text: 'Please enter a valid 10-digit mobile number.',
        confirmButtonColor: '#047857',
      })
      return
    }

    setLoading(true)
    try {
      await postJson('/auth/send-otp', { phone: mobileNumber })
      setOtp('')
      setStep(2)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Could not send OTP',
        text: error.message || 'Please try again.',
        confirmButtonColor: '#047857',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!/^\d{4}$/.test(otp)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid OTP',
        text: 'Please enter the 4-digit OTP.',
        confirmButtonColor: '#047857',
      })
      return
    }

    setLoading(true)
    try {
      const result = await postJson('/auth/verify-otp', { phone: mobileNumber, otp })
      login({
        ...(result.user || { phone: mobileNumber }),
        token: result.token || result.user?.token,
      })
      if (result.isNewCustomer === true) trackRegistration()
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!',
        confirmButtonColor: '#047857',
        timer: 1500,
        showConfirmButton: false,
      })
      onSuccess?.()
      reset()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: error.message || 'Please try again.',
        confirmButtonColor: '#047857',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    step,
    setStep,
    mobileNumber,
    setMobileNumber,
    otp,
    setOtp,
    loading,
    canContinue,
    handleContinue,
    handleLogin,
    reset,
  }
}
