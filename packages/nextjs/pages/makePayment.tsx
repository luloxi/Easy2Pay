import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Requests: NextPage = () => {
  const { isConnected } = useAccount();
  const [hasBeenCalled, setHasBeenCalled] = useState(false);
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const recipient = searchParams.get("recipient") || undefined;
  const amount = searchParams.get("amount") || undefined;
  const requestId = searchParams.get("requestId") || undefined;
  const { writeAsync: sendPaymentTx, isLoading } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "pay",
    args: [recipient, BigInt(requestId || "0")],
    // for payable functions, expressed in eth
    value: BigInt(amount || "0"),
    // the number of block confirmations to wait for before considering transaction to be confirmed (default : 1).
    blockConfirmations: 1,
    // the callback function to execute when the transaction is confirmed.
    onBlockConfirmation: txnreceipt => {
      console.log("transaction blockhash", txnreceipt.blockHash);
    },
  });

  useEffect(() => {
    if (!isConnected) openConnectModal?.();
  }, [isConnected, openConnectModal]);

  useEffect(() => {
    const sendPaymentTxAndHandleErr = async () => {
      const response = await sendPaymentTx();
      console.log({ response });
    };

    if (recipient && amount && requestId && !hasBeenCalled && !isLoading && isConnected) {
      sendPaymentTxAndHandleErr();
      setHasBeenCalled(true);
    }
  }, [recipient, amount, requestId, hasBeenCalled, isConnected]);

  return <></>;
};

export default Requests;
