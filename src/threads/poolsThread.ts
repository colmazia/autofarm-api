import { parentPort, workerData } from "worker_threads"
import { ethers } from "ethers";
import { autofarmAbi } from "../resources/abi";

const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

async function getPoolsInfoInRange() {

    for (let i = workerData.begin; i < workerData.end; i++) {
        const poolId = i
        let pool = await autofarmContract.poolInfo(poolId)
        parentPort.postMessage({
            poolId: poolId,
            tokenAddress: pool[0]
        })
    }
}

getPoolsInfoInRange();