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

const PAGE_SIZE = 5;

const Requests: NextPage = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<FilterProps[]>([
    { label: "Only requests made", selected: false },
    { label: "Only requests received", selected: false },
    { label: "Only completed requests", selected: false },
  ]);
  // const [totalItems, setTotalItems] = useState(0);
  // const [totalPages, setTotalPages] = useState(Math.ceil(totalItems / PAGE_SIZE));
  const [requestBox, setRequestBox] = useState<PaymentRequest[]>([]);

  const { address } = useAccount();

  const router = useRouter();

  const { data: RequestCreatedHistory } = useScaffoldEventHistory({
    contractName: "Easy2Pay",
    eventName: "RequestCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  const filterAndSetData = useCallback(
    (data: any[]) => {
      let filteredData = data;

      if (searchFilters[0]?.selected) {
        filteredData = data?.filter((event: any) => event.args["requester"] === address);
      }

      if (searchFilters[1]?.selected) {
        filteredData = data?.filter((event: any) => event.args["payer"] === address);
      }

      if (searchFilters[2]?.selected) {
        filteredData = filteredData?.filter(
          (event1: any) => !data?.some((event2: any) => event1?.args?.["requestId"] === event2?.args?.["requestId"]),
        );
      }

      if (searchInput && isAddress(searchInput)) {
        filteredData = data?.filter(
          (event: any) => event.args["requester"] === searchInput || event.args["payer"] === searchInput,
        );
      } else if (searchInput && !isNaN(parseInt(searchInput))) {
        const adjustedId = data !== undefined ? data?.length - parseInt(searchInput) : 0;
        const accessedElement = data?.[adjustedId];
        filteredData = accessedElement !== undefined ? [accessedElement] : [];
      }

      // setTotalPages(Math.ceil(filteredData?.length / PAGE_SIZE));
      // setTotalItems(filteredData?.length);

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = Math.min(startIndex + PAGE_SIZE, filteredData?.length);

      const slicedData = filteredData?.slice(startIndex, endIndex);

      // Assuming each element in slicedData has a "args" property
      const mappedData = slicedData?.map(event => ({
        requestId: event.args.requestId,
        amount: event.args.amount,
        completed: false, // Assuming this is not available in the event, adjust as needed
        payer: event.args.payer,
        requester: event.args.requester,
        reason: event.args.reason,
      }));

      setRequestBox(mappedData);
      setIsLoading(false);
    },
    [address, searchFilters, searchInput, currentPage],
  );

  useEffect(() => {
    if (RequestCreatedHistory) {
      filterAndSetData(RequestCreatedHistory);
    }
  }, [RequestCreatedHistory, filterAndSetData]);

  useInterval(() => {
    // Fetch events periodically if needed
  }, 1500);

  // const onPageChange = (page: number) => {
  //   setIsLoading(true);
  //   setCurrentPage(page);
  // };

  const updateSearchFilters = (index: number) => {
    setIsLoading(true);
    setCurrentPage(1);
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
    setCurrentPage(1);
    setSearchInput(newSearchInput);
  };

  const showLink = (requestId: number) => {
    // Use the actual requestId from the mapped data
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
                          Show Link
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
