import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode.react";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { EthAmount } from "~~/components/scaffold-eth/EthAmount";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const RequestDetailsPage: React.FC = () => {
  const router = useRouter();
  const { requestId } = router.query;
  const requestIdString: string = Array.isArray(requestId) ? requestId[0] : requestId || "";

  const { data: requestData } = useScaffoldContractRead({
    contractName: "Easy2Pay",
    functionName: "getRequest",
    args: [BigInt(requestIdString)],
  });

  const { writeAsync: pay } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "pay",
    args: [BigInt(requestIdString)],
    value: BigInt(requestData?.amount ?? 0),
  });

  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (requestIdString) {
      document.title = `Payment Request #${requestIdString}`;
    }
  }, [requestIdString]);

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  if (!requestId) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MetaHeader title={`Request #${requestIdString} | Easy2Pay`} description="List all payment requests" />
      <div className="flex items-center flex-col flex-grow pt-10 text-white">
        <div className="card w-96 bg-green-700 shadow-xl">
          <h1 className="text-center mt-4 text-3xl">Request #{requestIdString}</h1>
          <div className="card-body ">
            <span className="flex flex-row gap-3">
              Requester: <Address address={requestData?.requester} />
            </span>
            <span className="flex flex-row gap-3">
              Payer: <Address address={requestData?.payer} />
            </span>
            <span className="flex flex-row gap-3">
              Amount: <EthAmount amount={Number(requestData?.amount ?? 0)} />
            </span>

            <span className="flex flex-row gap-3">Reason: {requestData?.reason}</span>
            <span className="flex flex-row gap-3">Completed: {requestData?.completed ? "Yes" : "No"}</span>

            <div className="card-actions justify-end">
              <button
                className="btn btn-primary bg-orange-500 hover:bg-orange-600"
                onClick={event => {
                  event.preventDefault();
                  pay();
                }}
              >
                Send payment
              </button>
            </div>
          </div>
        </div>

        <div className="card w-96 bg-orange-700 shadow-xl mt-2">
          <div className="card-body">
            <h2 className="card-title text-2xl">Share this page!</h2>

            <div className="flex items-center justify-center">
              <QRCode value={window.location.href} size={150} />
            </div>

            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={handleCopyLink}>
                {copySuccess ? "Link Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestDetailsPage;
