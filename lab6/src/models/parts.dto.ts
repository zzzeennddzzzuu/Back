import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class PartsDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  otp: string;
}