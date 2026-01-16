import { ApiProperty } from "@nestjs/swagger";

export class HealthcheckResponse {
    @ApiProperty()
    status: string;
    @ApiProperty()
    date: string;
}