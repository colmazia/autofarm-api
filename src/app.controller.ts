import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
let pools: Array<any> = []

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
    if (pools.length === 0) {
      pools = await this.appService.getPoolsInfo();
      return {
        pools: pools
      }
    }
    return {
      pools: pools
    }
  }
}
