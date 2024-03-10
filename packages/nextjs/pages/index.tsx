import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput, Balance, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [payerAddress, setPayerAddress] = useState("");
  const [etherAmount, setEtherAmount] = useState("");
  const [motive, setMotive] = useState("");

  const { writeAsync: requestPayment } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "requestPayment",
    args: [parseEther(etherAmount), payerAddress, motive],
  });

  return (
    <>
      <MetaHeader />

      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-3xl">
          Welcome to{" "}
          <strong>
            Easy<span className="text-green-500">2</span>Pay
          </strong>
          !
        </h1>
        <p className="text-center">
          Create a payment request to a specific address, <br />
          and share it as a QR code or an URL!
          <br />
          <i className="text-green-500">currently only accepting native ETH as payment currency</i>
        </p>
        <div className="card w-96 bg-green-700 shadow-xl">
          <div className="p-4">
            <p className="mb-2">Enter the address of the payer of this request:</p>
            <AddressInput placeholder="0x..." value={payerAddress} onChange={setPayerAddress} />
            {payerAddress ? (
              <p className="flex flex-row my-2">
                This address has <Balance address={payerAddress} /> available
              </p>
            ) : (
              <p className="text-orange-500 text-center my-2">Enter an address to view their Balance!</p>
            )}
            <p className="mb-2">Enter the amount of Ether you want to receive:</p>
            <EtherInput value={etherAmount} onChange={setEtherAmount} />
            <p className="mb-2">Enter the motive of your request (optional):</p>
            <InputBase value={motive} onChange={setMotive} />
          </div>

          <div className="card-actions justify-end p-4">
            <button
              className="btn btn-primary bg-orange-500 mt-4"
              onClick={event => {
                event.preventDefault();
                requestPayment();
              }}
            >
              Request payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
