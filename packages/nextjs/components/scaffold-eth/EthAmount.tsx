import { formatEther } from "viem";
import { useAccountBalance } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type EthAmountProps = {
  amount: number;
  precision?: number;
};

/**
 * Display a token amount with a custom amount of precision.
 * If it's ETH, allow for showing its USD value with a button push.
 */
export const EthAmount = ({ amount, precision = 4 }: EthAmountProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { price, onToggleBalance, isEthBalance } = useAccountBalance();

  return (
    <div className="flex items-center justify-center">
      <button
        className={`btn btn-sm btn-accent bg-green-600 hover:bg-green-800 flex flex-col font-normal items-center hover:bg-transparent`}
        onClick={onToggleBalance}
      >
        <div className="w-full flex items-center justify-center">
          {isEthBalance ? (
            <>
              <span>{parseFloat(formatEther(BigInt(amount))).toFixed(precision)}</span>
              <span className="text-[0.8em] font-bold ml-1">{targetNetwork.nativeCurrency.symbol}</span>
            </>
          ) : (
            <>
              <span className="text-[0.8em] font-bold mr-1">$</span>
              <span>{parseFloat(formatEther(BigInt(amount * price))).toFixed(2)}</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};
