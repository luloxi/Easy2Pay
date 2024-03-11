import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useInterval } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { TokenAmount } from "~~/components/scaffold-eth/TokenAmount";
import { SearchBar } from "~~/components/searchBar/SearchBar";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { FilterProps } from "~~/types/Easy2PayTypes";

interface PaymentRequest {
  requestId: number;
  requester: string;
  payer: string;
  amount: bigint;
  completed: boolean;
  reason: string;
}

const Requests: NextPage = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFilters, setSearchFilters] = useState<FilterProps[]>([
    { label: "Only requests made", selected: false },
    { label: "Only requests received", selected: false },
    { label: "Only completed requests", selected: false },
  ]);
  const [requestBox, setRequestBox] = useState<PaymentRequest[]>([]);

  const { address } = useAccount();

  const router = useRouter();

  const { data: RequestCreatedHistory } = useScaffoldEventHistory({
    contractName: "Easy2Pay",
    eventName: "RequestCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const { data: RequestPaidHistory } = useScaffoldEventHistory({
    contractName: "Easy2Pay",
    eventName: "RequestPaid",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const filterAndSetData = useCallback(
    (createdData: any[], paidData: any[]) => {
      let filteredData = createdData;

      if (searchFilters[0]?.selected) {
        filteredData = createdData?.filter((event: any) => event.args["requester"] === address);
      }

      if (searchFilters[1]?.selected) {
        filteredData = createdData?.filter((event: any) => event.args["payer"] === address);
      }

      if (searchFilters[2]?.selected) {
        filteredData = filteredData?.filter((event1: any) =>
          paidData?.some((event2: any) => event1?.args?.["requestId"] === event2?.args?.["requestId"]),
        );
      }

      if (searchInput && isAddress(searchInput)) {
        filteredData = createdData?.filter(
          (event: any) => event.args["requester"] === searchInput || event.args["payer"] === searchInput,
        );
      } else if (searchInput && !isNaN(parseInt(searchInput))) {
        const adjustedId = createdData !== undefined ? createdData?.length - parseInt(searchInput) : 0;
        const accessedElement = createdData?.[adjustedId];
        filteredData = accessedElement !== undefined ? [accessedElement] : [];
      }

      const mappedData = filteredData?.map(event => {
        const requestId = event.args.requestId;
        const completed = paidData?.some((paidEvent: any) => paidEvent.args.requestId === requestId);
        return {
          requestId: requestId,
          amount: event.args.amount,
          completed: completed || false,
          payer: event.args.payer,
          requester: event.args.requester,
          reason: event.args.reason,
        };
      });

      setRequestBox(mappedData);
      setIsLoading(false);
    },
    [address, searchFilters, searchInput],
  );

  useEffect(() => {
    if (RequestCreatedHistory && RequestPaidHistory) {
      filterAndSetData(RequestCreatedHistory, RequestPaidHistory);
    }
  }, [RequestCreatedHistory, RequestPaidHistory, filterAndSetData]);

  useInterval(() => {
    // Fetch events periodically if needed
  }, 1500);

  const updateSearchFilters = (index: number) => {
    setIsLoading(true);

    setSearchFilters(prevFilters => {
      const updatedFilters = [...prevFilters];
      updatedFilters[index] = {
        ...updatedFilters[index],
        selected: !updatedFilters[index].selected,
      };
      return updatedFilters;
    });
  };

  const updateSearchInput = (newSearchInput: string) => {
    setIsLoading(true);

    setSearchInput(newSearchInput);
  };

  const showLink = (requestId: number) => {
    const actualRequestId = requestBox?.[requestId]?.requestId;
    if (actualRequestId !== undefined) {
      router.push(`/requests/${actualRequestId}`);
    }
  };

  return (
    <>
      <MetaHeader title="Payment Requests | Easy2Pay" description="List all payment requests" />
      <div className="flex items-center flex-col flex-grow pt-10">
        <SearchBar
          searchFilters={searchFilters}
          updateSearchFilters={updateSearchFilters}
          searchInput={searchInput}
          updateSearchInput={updateSearchInput}
        />
        {isLoading ? (
          <p className="text-2xl text-base-content">Loading...</p>
        ) : (
          <div className="overflow-x-auto shadow-lg">
            <table className="table table-zebra w-full">
              <thead className="text-center">
                <tr>
                  <th className="bg-primary">Requester</th>
                  <th className="bg-primary">Payer</th>
                  <th className="bg-primary">Amount</th>
                  <th className="bg-primary">Reason</th>
                  <th className="bg-primary">Link</th>
                  <th className="bg-primary">Complete</th>
                </tr>
              </thead>
              <tbody>
                {!requestBox || requestBox.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No requests found!
                    </td>
                  </tr>
                ) : (
                  requestBox?.map((request, requestId) => (
                    <tr key={requestId}>
                      <td>
                        <Address address={request.requester} />{" "}
                      </td>
                      <td>
                        <Address address={request.payer} />{" "}
                      </td>
                      <td>
                        <TokenAmount amount={request.amount ? parseInt(request.amount.toString()) : 0} isEth={true} />
                      </td>
                      <td>{request.reason}</td>
                      <td>
                        <button className="btn btn-primary bg-orange-500" onClick={() => showLink(requestId)}>
                          Share
                        </button>
                      </td>
                      <td>{request.completed ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Requests;
