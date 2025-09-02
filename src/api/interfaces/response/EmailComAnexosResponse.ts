import type { EmailResponse } from "./EmailResponse";
import type { AnexoResponse } from "./AnexoResponse";
import { BaseResponse } from "./BaseResponse";

export interface EmailComAnexosResponse extends BaseResponse {
  email: EmailResponse;
  anexos: AnexoResponse[];
}
