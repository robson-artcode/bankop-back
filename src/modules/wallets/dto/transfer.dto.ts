import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class TransferDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  amountCoin: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
