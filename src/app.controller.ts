import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { pools } from './resources/pools_for_test';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('autofarm/cache/update')
  async getPoolsInfo(): Promise<any> {
    const pools = await this.appService.getPoolsInfo()
    return {
      poolsLength: pools.length,
      pools: pools
    }
  }

  @Get('autofarm/:address')
  getAddressBalance(@Param('address') address: string) {
    return this.appService.testAddressBalance(address);
  }

}
