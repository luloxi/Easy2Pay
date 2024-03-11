// pages/requests/[requestId].tsx
import { useRouter } from "next/router";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const RequestDetailsPage: React.FC = () => {
  const router = useRouter();
  const { requestId } = router.query;
  const requestIdString: string = Array.isArray(requestId) ? requestId[0] : requestId || "";

  const { data: requestData } = useScaffoldContractRead({
    contractName: "Easy2Pay",
    functionName: "getRequest",
    args: [BigInt(requestIdString)],
  });

  if (!requestId) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MetaHeader title="Request a payment | Easy2Pay" description="List all payment requests" />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="card w-96 bg-base-100 shadow-xl">
          <h1 className="text-center mt-4 text-3xl">Payment Request #{requestIdString}</h1>
          <div className="card-body">
            <h2 className="card-title">Shoes!</h2>
            <p>{requestData?.requester?.toLowerCase()}If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestDetailsPage;
