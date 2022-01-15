import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test/eth')
  getTest(): any {
    return this.appService.getTestEth();
  }

  @Get('autofarm/cache/update')
  async getPoolsInfo(): Promise<any> {
      return this.appService.getPoolsInfo();
  }

  @Get('autofarm/:address')
  getAddressBalance(@Param('address') address: string) {
    return this.appService.getAddressBalance(address);
  }

}
