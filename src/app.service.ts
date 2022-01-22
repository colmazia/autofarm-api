import { Injectable } from '@nestjs/common';
import { ethers } from "ethers";
import { autofarmAbi, PancakeLPAbi, cakeAbi } from './resources/abi'
import { Worker } from "worker_threads"

// create autofarm contract
const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

// create local variable to store data 
const threadPools = []
const threadFarms = new Map()
const farmsVisited = new Map()
const maximumThread = 4
let isPoolsInfoCalled = false

@Injectable()
export class AppService {

  async getPoolsInfo(): Promise<any> {
    const poolLength: number = await autofarmContract.poolLength();
    // limit creating thread to one time only
    if (isPoolsInfoCalled) {
      return threadPools
    }
    isPoolsInfoCalled = true;
    // create thread to query pool info
    for (let threadIdx = 0; threadIdx < maximumThread; threadIdx++) {
      const worker1 = new Worker("./dist/threads/poolsThread.js", {
        workerData: {
          begin: threadIdx === 0 ? 1 : Math.floor(poolLength * threadIdx / maximumThread),
          end: Math.floor(poolLength * (threadIdx + 1) / maximumThread)
        }
      });
      worker1.on("message", (value) => {
        threadPools.push(value);
        console.log(`message received from pools thread ${threadIdx} : `, value);
      })
      worker1.on("exit", () => {
        console.log(`Closing pool thread ${threadIdx}`);
      });
    }
    // return info for the time being
    return threadPools
  }

  async getAddressBalance(address: string): Promise<any> {

    const poolLength: number = await autofarmContract.poolLength();
    const poolsInfo = await this.getPoolsInfo();
    if (threadFarms.get(address) === undefined) {
      threadFarms.set(address, [])
      farmsVisited.set(address, [])
    }
    //create thread to query for farm info of address
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
        const currentFarm = threadFarms.get(address).find(obj => {
          return obj.poolId === value.poolId
        })
        // check if threadFarms doesn't already have that farm info
        if (currentFarm === undefined) {
          threadFarms.get(address).push(value);
          console.log(`Farm Thread ${threadIdx} message: `, value);
        }
      })
      worker.on("exit", () => {
        console.log(`Closing Farm Thread ${threadIdx}`);
      });
    }
    // return farm info for the time being
    return {
      farms: threadFarms.get(address)
    }

  }
}
