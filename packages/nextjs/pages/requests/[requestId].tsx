// pages/requests/[requestId].tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

const RequestDetailsPage: React.FC = () => {
  const router = useRouter();
  const { requestId } = router.query;

  useEffect(() => {
    // Fetch payment details using the requestId from the query parameters
    // You can use this data to render the payment details on the page
  }, [requestId]);

  if (!requestId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="card w-96 bg-base-100 shadow-xl">
        <h1 className="text-center mt-4 text-3xl">Payment Request #{requestId}</h1>
        <div className="card-body">
          <h2 className="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPage;
