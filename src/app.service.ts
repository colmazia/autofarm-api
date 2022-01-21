import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import { autofarmAbi, PancakeLPAbi, cakeAbi } from './resources/abi'
import { Worker } from "worker_threads"
// import { pools } from './resources/pools_for_test'

const threadPools = []
const threadFarms = new Map()
const farmsVisited = new Map()
const maximumThread = 4
let isPoolsInfoCalled = false

@Injectable()
export class AppService {

  // async getPoolsInfo(): Promise<any> {
  //   // provide the needed information and create a contract object
  //   const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
  //   const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
  //   const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

  //   if (pools.length === 0) {
  //     let poolLength: number = await autofarmContract.poolLength();

  //     const testPools = [46, 150, 560]
  //     for (let i = 1; i < poolLength; i++) {
  //       const poolId = i
  //       let pool = await autofarmContract.poolInfo(poolId)
  //       pools.push({
  //         poolId: poolId,
  //         tokenAddress: pool[0]
  //       })
  //     }
  //   }

  //   return pools

  // }

  async getPoolsInfo(): Promise<any> {

    const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
    const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
    const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)
    const poolLength: number = await autofarmContract.poolLength();

    if (isPoolsInfoCalled) {
      return threadPools
    }
    isPoolsInfoCalled = true;
    for (let threadIdx = 0; threadIdx < maximumThread; threadIdx++) {
      const worker1 = new Worker("./dist/threads/poolsThread.js", {
        workerData: {
          begin: threadIdx === 0 ? 1 : Math.floor(poolLength * threadIdx / maximumThread),
          end: Math.floor(poolLength * (threadIdx + 1) / maximumThread)
        }
      });
      worker1.on("message", (value) => {
        threadPools.push(value);
        console.log(`message received from thread ${threadIdx} : `, value);
      })
      worker1.on("exit", () => {
        console.log(`Closing ${threadIdx}`);
      });
    }
    return threadPools
  }

  // async getAddressBalance(address: string): Promise<any> {
  //   // provide the needed information and create a contract object
  //   const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
  //   const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
  //   const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

  //   const poolLength: number = await autofarmContract.poolLength();
  //   let _poolsInfo = await this.getPoolsInfo();
  //   if (threadFarms.get(address) === undefined) {
  //     threadFarms.set(address, [])
  //   }
  //   const farms = []


  //   const testPools = [46, 150, 560]
  //   for (let i = 1; i < poolLength; i++) {
  //     const poolId = i
  //     try {
  //       let amount = await autofarmContract.stakedWantTokens(poolId, address)
  //       if (amount > 0) {
  //         const currentPool = _poolsInfo.find(obj => {
  //           return obj.poolId === poolId
  //         })
  //         // const tokenAbi = await this.getAddressAbi(currentPool.tokenAddress)
  //         const rewardsAmount = (await autofarmContract.pendingAUTO(poolId, address)) / (10 ** 18)
  //         farms.push(await this.getFarmInfo(currentPool.tokenAddress, provider, amount, rewardsAmount))
  //       }
  //     }
  //     catch (e) {
  //       console.log(e.message)
  //     }
  //   }

  //   return {
  //     farms: farms
  //   }
  // }

  async testAddressBalance(address: string): Promise<any> {
    // provide the needed information and create a contract object
    const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
    const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
    const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

    const poolLength: number = await autofarmContract.poolLength();
    const poolsInfo = await this.getPoolsInfo();
    if (threadFarms.get(address) === undefined) {
      threadFarms.set(address, [])
      farmsVisited.set(address, [])
    }
    console.log('farmsVisted', farmsVisited.get(address))
    for (let threadIdx = 0; threadIdx < maximumThread; threadIdx++) {
      const worker = new Worker("./dist/threads/farmBalanceThread.js", {
        workerData: {
          begin: threadIdx === 0 ? 1 : Math.floor(poolLength * threadIdx / maximumThread),
          end: Math.floor(poolLength * (threadIdx + 1) / maximumThread),
          address: address,
          poolsInfo: poolsInfo,
          farmsVisited: farmsVisited.get(address)
        }
      });
      worker.on("message", (value) => {
        if (Number.isInteger(value)) {
          farmsVisited.get(address).push(value)
        }
        else {
          const currentFarm = threadFarms.get(address).find(obj => {
            return obj.poolId === value.poolId
          })
          if (currentFarm === undefined) {
            threadFarms.get(address).push(value);
            console.log(`Farm Thread ${threadIdx} message: `, value);
          }
        }
      })
      worker.on("exit", () => {
        console.log("Closing 1");
      });
    }
    const worker1 = new Worker("./dist/threads/farmBalanceThread.js", {
      workerData: {
        begin: 150,
        end: 170,
        address: address,
        poolsInfo: poolsInfo,
        farmsVisited: farmsVisited.get(address)
      }
    });
    worker1.on("message", (value) => {
      if (Number.isInteger(value)) {
        farmsVisited.get(address).push(value)
      }
      else {
        const currentFarm = threadFarms.get(address).find(obj => {
          return obj.poolId === value.poolId
        })
        if (currentFarm === undefined) {
          threadFarms.get(address).push(value);
          console.log("=================================================\nmessage received from thread farms 1: ", value);
        }
      }
    })
    worker1.on("exit", () => {
      console.log("Closing 1");
    });

    return {
      farms: threadFarms.get(address)
    }

  }

  async getFarmInfo(tokenAddress: string, provider, amount, rewardsAmount) {
    try {
      // try assume that it is LP-token
      const LPtokenContract = new ethers.Contract(tokenAddress, PancakeLPAbi, provider)

      const token0Address = await LPtokenContract.token0()
      const token1Address = await LPtokenContract.token1()
      const token0Contract = new ethers.Contract(token0Address, cakeAbi, provider)
      const token1Contract = new ethers.Contract(token1Address, cakeAbi, provider)
      const reserves = await LPtokenContract.getReserves()

      return ({
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
        poolAddress: "0x0895196562C7868C5Be92459FaE7f877ED450452"
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
}
