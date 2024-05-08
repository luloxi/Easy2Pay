import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode.react";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
} from "~~/hooks/scaffold-eth";

const RequestDetailsPage: React.FC = () => {
  const router = useRouter();
  const { requestId } = router.query;
  const requestIdString: string = Array.isArray(requestId) ? requestId[0] : requestId || "";

  const { data: requestData } = useScaffoldContractRead({
    contractName: "Easy2Pay",
    functionName: "getRequest",
    args: [BigInt(requestIdString)],
  });

  const { data: requestAmountInEth } = useScaffoldContractRead({
    contractName: "Easy2Pay",
    functionName: "getRequestAmountInEth",
    args: [BigInt(requestIdString)],
  });

  const { data: RequestPaidHistory } = useScaffoldEventHistory({
    contractName: "Easy2Pay",
    eventName: "RequestPaid",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  // Function to find who paid for the request
  const findPayer = () => {
    if (RequestPaidHistory && requestData) {
      const paidEvent = RequestPaidHistory.find((event: any) => event.args.requestId.toString() === requestIdString);
      if (paidEvent) {
        return paidEvent.args.payer;
      }
    }
    return "Unknown";
  };

  const { writeAsync: payWithEth } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "payWithEth",
    args: [BigInt(requestIdString)],
    value: BigInt(requestAmountInEth ?? 0),
  });

  const { data: easy2PayInfo } = useDeployedContractInfo("Easy2Pay");

  const { writeAsync: approve } = useScaffoldContractWrite({
    contractName: "USDC",
    functionName: "approve",
    args: [easy2PayInfo?.address, BigInt(requestData?.amount ?? 0)],
  });

  const { writeAsync: payWithUsdc } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "payWithUsdc",
    args: [BigInt(requestIdString)],
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
        <div className={`card w-96 ${requestData?.completed ? "bg-green-700" : "bg-red-700"} shadow-xl`}>
          <h1 className="text-center mt-4 text-3xl">Request #{requestIdString}</h1>
          <div className="card-body ">
            <span className="flex flex-row gap-3">
              Requester: <Address address={requestData?.requester} />
            </span>

            <span className="flex flex-row items-center gap-3">
              Amount: ${(Number(requestData?.amount ?? 0) / 1000000).toFixed(2)}
            </span>

            <span className="flex flex-row gap-3">Reason: {requestData?.reason}</span>
            <span className="flex flex-row gap-3">Completed: {requestData?.completed ? "Yes" : "No"}</span>

            {/* Display who paid for the request */}
            {requestData?.completed && (
              <span className="flex flex-row gap-3">
                Paid by: <Address address={findPayer()} />
              </span>
            )}

            <div className="card-actions justify-end">
              <button
                className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-none"
                onClick={event => {
                  event.preventDefault();
                  payWithEth();
                }}
              >
                Pay with ETH
              </button>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 border-none"
                onClick={event => {
                  event.preventDefault();
                  approve();
                }}
              >
                Approve USDC
              </button>
              <button
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 border-none"
                onClick={event => {
                  event.preventDefault();
                  payWithUsdc();
                }}
              >
                Pay with USDC
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
