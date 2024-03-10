import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput, EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [payerAddress, setPayerAddress] = useState("");
  const [etherAmount, setEtherAmount] = useState("");

  const { writeAsync: requestPayment } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "requestPayment",
    args: [parseEther(etherAmount), payerAddress],
  });

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-3xl">Welcome to Easy2Pay!</h1>
        <p className="text-center">
          Create a payment request to a specific address, and share it on a QR code!
          <br />
          <i className="text-green-500">currently only accepting native ETH as payment currency</i>
        </p>

        <p className="mb-2">Enter the address of the payer of this request:</p>
        <AddressInput placeholder="0x..." value={payerAddress} onChange={setPayerAddress} />
        <p className="mb-2">Enter the amount of Ether you want to receive:</p>
        <EtherInput value={etherAmount} onChange={setEtherAmount} />
        <button
          className="btn btn-warning mt-4"
          onClick={event => {
            event.preventDefault();
            requestPayment();
          }}
        >
          Request payment
        </button>
      </div>
    </>
  );
};

export default Home;
