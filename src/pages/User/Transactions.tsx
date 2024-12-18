import { Wallet } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import Spinner from '../../components/Spinner'
import PaginationControls from '../../components/ui/PaginationControls'
import { ITransaction } from '../../types/transactionTypes'

const API_URL = 'http://localhost:3000/'

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(4)
  const [error, setError] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return

      try {
        const response = await fetch(`${API_URL}transactions`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }

        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        setError('An error occurred while fetching transactions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem)

  if (isLoading) return <Spinner />

  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="container mx-auto px-2 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Transactions</h1>
      <div className="flex items-center space-x-2 p-3 rounded-lg shadow-lg">
        <Wallet className="text-primary" />
        <span className="text-lg font-semibold">Wallet Balance: ₹ {user?.wallet ? user.wallet.toFixed(2) : '0.00'}</span>
      </div>
      <div className="w-full">
        {transactions.length === 0 ? (
          <p className="text-center py-4">No transactions found.</p>
        ) : (
          <div className="shadow-md rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3">Booking ID</th>
                  <th scope="col" className="px-4 py-3">Hotel</th>
                  <th scope="col" className="px-4 py-3">Check-in</th>
                  <th scope="col" className="px-4 py-3">Check-out</th>
                  <th scope="col" className="px-4 py-3">Total Price</th>
                  <th scope="col" className="px-4 py-3">Payment Type</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.bookingId}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{transaction.bookingId}</td>
                    <td className="px-4 py-3">{transaction.hotelName}</td>
                    <td className="px-4 py-3">{new Date(transaction.checkInDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(transaction.checkOutDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">₹{transaction.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">{transaction.transactionType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
         <div className="flex justify-center items-center py-4 ">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
      </div>
    </div>
  )
}

export default TransactionsPage
