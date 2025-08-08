import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConvertDto {
  @IsNotEmpty()
  @IsNumber()
  opCoins: number;
}
