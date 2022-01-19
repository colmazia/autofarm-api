import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('autofarm/cache/update')
  async getPoolsInfo(): Promise<any> {
    return {
      pools: await this.appService.getPoolsInfo()
    }
  }

  @Get('autofarm/:address')
  getAddressBalance(@Param('address') address: string) {
    return this.appService.getAddressBalance(address);
  }

}
