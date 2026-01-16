import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { HealthcheckResponse } from "src/responses/healthcheck.response";

@ApiTags('Healthcheck')
@Controller('healthcheck')
export class HealthcheckController {
  @Get()
  @ApiOkResponse({ type: HealthcheckResponse })
  getHealthStatus(): HealthcheckResponse {
    return { 
        status: 'OK',
        date: new Date().toISOString(),
    };
  }
}