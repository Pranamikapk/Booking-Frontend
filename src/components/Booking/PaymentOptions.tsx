import React from "react"
import Card from "../ui/Card"

interface PaymentOptionsProps {
  paymentOption: 'full' | 'partial' | 'wallet'
  total: number
  walletBalance: number
  handlePaymentOptionChange: (option: 'full' | 'partial' | 'wallet') => void
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ paymentOption, total, walletBalance, handlePaymentOptionChange }) => {
  const showWalletOption = walletBalance > 0 && walletBalance >= total
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            checked={paymentOption === 'full'}
            onChange={() => handlePaymentOptionChange('full')}
            className="form-radio"
          />
          <span>Pay full amount (₹{total.toFixed(2)})</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            checked={paymentOption === 'partial'}
            onChange={() => handlePaymentOptionChange('partial')}
            className="form-radio"
          />
          <span>Pay 20% now (₹{(total * 0.2).toFixed(2)})</span>
        </label>
        {showWalletOption && (
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              checked={paymentOption === 'wallet'}
              onChange={() => handlePaymentOptionChange('wallet')}
              className="form-radio"
            />
            <span>Pay from wallet (Balance: ₹{walletBalance.toFixed(2)})</span>
          </label>
        )}
      </div>
    </Card>
  )
}

export default PaymentOptions
