import { IsString, IsNotEmpty } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  originalLink: string;
}

declare global {
  namespace Express {
    interface User {
      email: string;
      
    }
  }
}

