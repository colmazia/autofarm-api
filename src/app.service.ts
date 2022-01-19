import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { BigNumber, ethers } from "ethers";
import { autofarmAbi, PancakeLPAbi, cakeAbi } from './abi'
let pools: Array<any> = []

@Injectable()
export class AppService {

  constructor(private readonly httpService: HttpService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getTestEth(): Promise<string> {
    const provider = ethers.getDefaultProvider();
    const daiAddress = "dai.tokens.ethers.eth";

    // The ERC-20 Contract ABI, which is a common contract interface
    // for tokens (this is the Human-Readable ABI format)
    const daiAbi = [
      // Some details about the token
      "function name() view returns (string)",
      "function symbol() view returns (string)",

      // Get the account balance
      "function balanceOf(address) view returns (uint)",

      // Send some of your tokens to someone else
      "function transfer(address to, uint amount)",

      // An event triggered whenever anyone transfers to someone else
      "event Transfer(address indexed from, address indexed to, uint amount)"
    ];

    // The Contract object
    const daiContract = new ethers.Contract(daiAddress, daiAbi, provider)

    return await daiContract.name()
  }

  async getPoolsInfo(): Promise<any> {
    // provide the needed information and create a contract object
    const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
    const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
    const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

    if (pools.length === 0) {
      let poolLength: number = await autofarmContract.poolLength();
      // for (let i = 1; i < poolLength; i++) {
      //   let pool = await autofarmContract.poolInfo(i)
      //   pools.push({
      //     poolId: i,
      //     tokenAddress: pool[0]
      //   })
      // }

      const testPools = [150, 560]
      for (let i = 0; i < testPools.length; i++) {
        let pool = await autofarmContract.poolInfo(testPools[i])
        pools.push({
          poolId: testPools[i],
          tokenAddress: pool[0]
        })
      }
    }

    return pools

  }

  async getAddressBalance(address: string): Promise<any> {
    // provide the needed information and create a contract object
    const provider = ethers.getDefaultProvider('https://bsc-dataseed.binance.org/');
    const autofarmAddress = '0x0895196562C7868C5Be92459FaE7f877ED450452';
    const autofarmAbi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "EmergencyWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "inputs": [], "name": "AUTO", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "AUTOMaxSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "AUTOPerBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "AUTOv2", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_allocPoint", "type": "uint256" }, { "internalType": "contract IERC20", "name": "_want", "type": "address" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" }, { "internalType": "address", "name": "_strat", "type": "address" }], "name": "add", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "burnAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_wantAmt", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_from", "type": "uint256" }, { "internalType": "uint256", "name": "_to", "type": "uint256" }], "name": "getMultiplier", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "inCaseTokensGetStuck", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "massUpdatePools", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_inputAmt", "type": "uint256" }], "name": "migrateToAUTOv2", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "ownerAUTOReward", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" }], "name": "pendingAUTO", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "contract IERC20", "name": "want", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "accAUTOPerShare", "type": "uint256" }, { "internalType": "address", "name": "strat", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "poolLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" }], "name": "set", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" }], "name": "stakedWantTokens", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "startBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalAllocPoint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }], "name": "updatePool", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "userInfo", "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_wantAmt", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }], "name": "withdrawAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
    const autofarmContract = new ethers.Contract(autofarmAddress, autofarmAbi, provider)

    const poolLength: number = await autofarmContract.poolLength();
    let farms: Array<any> = []
    let _poolsInfo = await this.getPoolsInfo();


    const testPools = [150, 560]
    for (let i = 0; i < testPools.length; i++) {
      const poolId = testPools[i]
      let amount = await autofarmContract.stakedWantTokens(poolId, address)
      if (amount > 0) {
        const currentPool = _poolsInfo.find(obj => {
          return obj.poolId === poolId
        })
        // const tokenAbi = await this.getAddressAbi(currentPool.tokenAddress)
        const rewardsAmount = (await autofarmContract.pendingAUTO(poolId, address)) / (10 ** 18)
        farms.push(await this.getFarmInfo(currentPool.tokenAddress, provider, amount, rewardsAmount))
      }
    }

    return {
      farms: farms
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

  async getAddressAbi(address: string): Promise<string> {
    const response = await this.httpService
      .get(`http://api.bscscan.com/api?module=contract&action=getabi&address=${address}&format=raw`)
      .toPromise()
      .catch((err) => {
        throw new HttpException(err.response.data, err.response.status);
      });

    return response.data;
  }
}
