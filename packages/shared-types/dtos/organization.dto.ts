import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrganizationDto {
  @ApiProperty({
    example: "Organization XYZ",
    description: "Organization name",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
