import { useEffect, useState } from "react";
import type { NextPage } from "next";
import QRCode from "react-qr-code";
import { useInterval } from "usehooks-ts";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { TokenAmount } from "~~/components/scaffold-eth/TokenAmount";
import { SearchBar } from "~~/components/searchBar/SearchBar";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { FilterProps } from "~~/types/Easy2PayTypes";
import { notification } from "~~/utils/scaffold-eth";

interface PaymentRequest {
  requester: string;
  payer: string;
  amount: bigint;
  completed: boolean;
  reason: string;
}

interface QRCodeInfo extends PaymentRequest {
  url: string;
}

const PAGE_SIZE = 5;

const Requests: NextPage = () => {
  const [qrCodeInfo, setQrCodeInfo] = useState<QRCodeInfo>();
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

  const { data: RequestCreatedHistory } = useScaffoldEventHistory({
    contractName: "Easy2Pay",
    eventName: "RequestCreated",
    fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0"),
    watch: true,
  });

  useEffect(() => {
    if (RequestCreatedHistory) {
      filterAndSetData(RequestCreatedHistory);
    }
  }, [RequestCreatedHistory, searchFilters, searchInput, currentPage]);

  const filterAndSetData = (data: any[]) => {
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
      amount: event.args.amount,
      completed: false, // Assuming this is not available in the event, adjust as needed
      payer: event.args.payer,
      requester: event.args.requester,
      reason: event.args.reason,
    }));

    setRequestBox(mappedData);
    setIsLoading(false);
  };

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

  const showLink = (request: PaymentRequest, requestId: number) => {
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
                        <button className="btn btn-primary bg-orange-500" onClick={() => showLink(request, requestId)}>
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
