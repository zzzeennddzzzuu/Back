import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, ValidateNested } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BooksDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [PageLinkDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => PageLinkDto)
  pageLinks: PageLinkDto[];
}
class PageLinkDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  pageLink: string;
}