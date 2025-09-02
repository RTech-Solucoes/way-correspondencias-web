import type { AreaResponse } from "./AreaResponse";
import { BaseResponse } from "./BaseResponse";

export interface ResponsavelAreaResponse extends BaseResponse {
  idResponsavelArea: number;
  area: AreaResponse;
}
