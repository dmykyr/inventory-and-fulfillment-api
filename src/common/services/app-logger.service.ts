import { Injectable, Logger, Scope } from '@nestjs/common';

export class LogDto {
  timestamp: string;
  context: string;
  type: string;
  message: string;
  trace?: string;
}

@Injectable({ scope: Scope.DEFAULT })
export class AppLoggerService extends Logger {
  log(dto: LogDto) {
    super.log(this.parseLogDto(dto, 'INFO'));
  }

  error(dto: LogDto) {
    super.error(this.parseLogDto(dto, 'ERROR'));
  }

  private parseLogDto(dto: LogDto, logLevel: string): string 
  {
    return `
==================== ${logLevel} LOG ====================
Time: ${dto.timestamp}
Context: ${dto.context}
Message: ${dto.message}
Type: ${dto.type}
Trace: ${dto.trace || 'No trace'}
===================================================
    `
  }
}
