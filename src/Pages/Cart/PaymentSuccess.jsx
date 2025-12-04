import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const tranId = query.get("tran_id");

  return (
    <div className="text-center py-24">
      <h2 className="text-3xl font-bold">Payment Successful!</h2>
      <p className="mt-4">Transaction ID: <strong>{tranId}</strong></p>
      <p className="mt-2">Your order has been placed successfully.</p>
    </div>
  );
};

export default PaymentSuccess;
