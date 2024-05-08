import { useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [usdAmount, setUsdAmount] = useState<number>(0);
  const [reason, setReason] = useState("");

  const { writeAsync: requestPayment } = useScaffoldContractWrite({
    contractName: "Easy2Pay",
    functionName: "requestPayment",
    args: [BigInt(usdAmount * 10e5), reason],
  });

  return (
    <>
      <MetaHeader title="Request a payment | Easy2Pay" description="List all payment requests" />

      <div className="flex items-center flex-col flex-grow pt-10 ">
        <h1 className="text-3xl">
          Welcome to{" "}
          <strong>
            Easy<span className="text-green-500">2</span>Pay
          </strong>
          !
        </h1>
        <p className="text-center">
          Create a payment request <br />
          and <strong>share it as a QR code or an URL</strong>!
          <br />
          <i className="text-green-500">currently accepting native ETH and USDC as payment methods</i>
        </p>
        <div className="card w-96 bg-green-700 shadow-xl text-white">
          <div className="p-4">
            <p className="mb-2">
              Enter the <strong>amount of USD</strong> you want to receive:
            </p>
            <InputBase value={usdAmount} placeholder="15" onChange={setUsdAmount} />
            <p className="mb-2">
              Enter the <strong>reason of your request</strong> (optional):
            </p>
            <InputBase value={reason} placeholder="Pizza and beer" onChange={setReason} />
          </div>

          <div className="card-actions justify-end p-4">
            <button
              className="btn btn-primary bg-orange-500 hover:bg-orange-600 border-none mt-4"
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
