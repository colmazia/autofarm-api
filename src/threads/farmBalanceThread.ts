import { parentPort, workerData } from "worker_threads"
import { ethers } from "ethers"
import { autofarmAbi, cakeAbi, PancakeLPAbi } from "src/resources/abi"

const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

async function getAddressBalanceInrange() {
    const _poolsInfo = workerData.poolsInfo
    for (let i = workerData.begin; i < workerData.end; i++) {
        const poolId = i
        try {
            const currentFarm = workerData.farmsVisited.find(obj => {
                return obj === poolId
            })
            const currentPool = _poolsInfo.find(obj => {
                return obj.poolId === poolId
            })
            if (currentFarm !== undefined || currentPool === undefined) {
                console.log('this should continue', workerData.farmsVisited)
                continue;
            }
            parentPort.postMessage(poolId)
            let amount = await autofarmContract.stakedWantTokens(poolId, workerData.address)
            if (amount > 0) {
                console.log('enter this route with', poolId)

                // const tokenAbi = await this.getAddressAbi(currentPool.tokenAddress)
                console.log('and also enter this route with', poolId)
                const rewardsAmount = (await autofarmContract.pendingAUTO(poolId, workerData.address)) / (10 ** 18)
                const farm = await getFarmInfo(currentPool.tokenAddress, provider, amount, rewardsAmount, poolId)
                parentPort.postMessage(farm)

            }
        }
        catch (e) {
            console.log(e.message)
        }
    }
}

async function getFarmInfo(tokenAddress: string, provider, amount, rewardsAmount, poolId) {
    try {
        // try assume that it is LP-token
        const LPtokenContract = new ethers.Contract(tokenAddress, PancakeLPAbi, provider)

        const token0Address = await LPtokenContract.token0()
        const token1Address = await LPtokenContract.token1()
        const token0Contract = new ethers.Contract(token0Address, cakeAbi, provider)
        const token1Contract = new ethers.Contract(token1Address, cakeAbi, provider)
        const reserves = await LPtokenContract.getReserves()

        return ({
            poolId: poolId,
            tokens: [{
                symbol: await token0Contract.symbol(),
                address: token0Address,
                balance: amount * (reserves._reserve0) / (await LPtokenContract.totalSupply()) / (10 ** (await token0Contract.decimals()))
            },
            {
                symbol: await token1Contract.symbol(),
                address: token1Address,
                balance: amount * (reserves._reserve1) / (await LPtokenContract.totalSupply()) / (10 ** (await token1Contract.decimals()))
            },

            ],
            balance: amount / (10 ** (await LPtokenContract.decimals())),
            lpAddress: tokenAddress,
            rewards: [
                {
                    symbol: "AUTO",
                    address: "0xa184088a740c695e156f91f5cc086a06bb78b827",
                    balance: rewardsAmount
                }
            ],
            poolAddress: 0x0895196562C7868C5Be92459FaE7f877ED450452
        })
    } catch (e) {
        // if it catch an error, that means it is single token
        const tokenContract = new ethers.Contract(tokenAddress, cakeAbi, provider)

        return ({
            tokens: [{
                symbol: await tokenContract.symbol(),
                address: tokenAddress,
                balance: amount / (10 ** (await tokenContract.decimals()))
            }
            ],
            balance: amount / (10 ** (await tokenContract.decimals())),
            lpAddress: tokenAddress,
            rewards: [
                {
                    symbol: "AUTO",
                    address: "0xa184088a740c695e156f91f5cc086a06bb78b827",
                    balance: rewardsAmount
                }
            ],
            poolAddress: 0x0895196562C7868C5Be92459FaE7f877ED450452
        })
    }
}

getAddressBalanceInrange()