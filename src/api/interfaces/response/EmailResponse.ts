import { BaseResponse } from "./BaseResponse";
import type { StatusAtivoResponse } from "./StatusAtivoResponse";

export interface EmailResponse extends BaseResponse {
  idEmail: number;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  dsCorpo: string;
  dtRecebimento: string;
  flAtivo: StatusAtivoResponse;
}
