import { useEffect, useState } from "react";
import type { NextPage } from "next";
import QRCode from "react-qr-code";
import { useLocalStorage } from "usehooks-ts";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface PaymentRequest {
  amount: bigint;
  completed: boolean;
}

interface QRCodeInfo extends PaymentRequest {
  url: string;
}

const selectedContractStorageKey = "scaffoldEth2.selectedContract";

const contractNames = getContractNames();

const Requests: NextPage = () => {
  const [qrCodeInfo, setQrCodeInfo] = useState<QRCodeInfo>();
  const { address } = useAccount();
  const [selectedContract, setSelectedContract] = useLocalStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
  );

  const { data: paymentRequests } = useScaffoldContractRead({
    contractName: "EasyPay",
    functionName: "getRequests",
    args: [address],
  });

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [selectedContract, setSelectedContract]);

  const showLink = (request: { amount: bigint; completed: boolean }, requestId: number) => {
    const url = `${window.origin}/makePayment?recipient=${address}&amount=${request.amount}&requestId=${requestId}`;
    setQrCodeInfo({
      ...request,
      url,
    });
    const modalEl = document.getElementById("qr_code_modal") as any;
    modalEl?.showModal();
  };

  const copyUrl = async (url?: string) => {
    if (url) {
      await navigator.clipboard.writeText(url);
      notification.success("Copied payment link");
    }
  };

  return (
    <>
      <MetaHeader title="Payment Requests | EasyPay" description="List all payment requests" />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-3">
            <span className="block text-2xl font-bold">All Payment Requests</span>
          </h1>
        </div>
        <div className="overflow-x-auto shadow-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="bg-primary">Amount</th>
                <th className="bg-primary">Complete</th>
                <th className="bg-primary">Link</th>
              </tr>
            </thead>
            <tbody>
              {!paymentRequests || paymentRequests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    No requests made
                  </td>
                </tr>
              ) : (
                paymentRequests?.map((request, requestId) => {
                  return (
                    <tr key={requestId}>
                      <td>{formatEther(request.amount)} ETH</td>
                      <td>{request.completed ? "Yes" : "No"}</td>
                      <td>
                        <button className="btn" onClick={() => showLink(request, requestId)}>
                          Show Link
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <dialog id="qr_code_modal" className="modal">
          <div className="modal-box flex justify-center">
            <div className="cursor-pointer" data-tip="Click to copy link" onClick={() => copyUrl(qrCodeInfo?.url)}>
              <QRCode value={qrCodeInfo?.url || ""} />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop cursor-default">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </>
  );
};

export default Requests;
