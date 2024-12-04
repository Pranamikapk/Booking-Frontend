import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import TransactionTable from '../../components/ui/TransactionTable';

let API_URL = 'http://localhost:3000'

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const admin = useSelector((state:RootState)=>state.adminAuth.admin)
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = admin?.token
        const response = await axios.get(`${API_URL}/admin/transactions`,{
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, 
        });
        console.log("Transactions:",response.data);
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching admin transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div>
        <h1 className="text-black text-4xl font-bold mb-5">Transactions</h1>
        <TransactionTable transactions={transactions} role="admin" />
    </div>
  );
};

export default Transactions;
