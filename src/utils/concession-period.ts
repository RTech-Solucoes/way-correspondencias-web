import dayjs, { type Dayjs } from "dayjs";
import concessionariaClient from "@/api/concessionaria/client";
import { AnoConcessaoConcessionariaResponse } from "@/api/concessionaria/types";
import { construirDataComAno } from "./utils";

function calcularPeriodoConcessao(
  anoConcessao: AnoConcessaoConcessionariaResponse | null | undefined,
  dataReferencia: Dayjs = dayjs()
) {
  if (!anoConcessao) {
    return { dtInicio: null, dtFim: null, anoBase: null };
  }

  const anoAtual = dataReferencia.year();
  const baseEsteAno = construirDataComAno(anoConcessao.dtBaseInicioConcessao, anoAtual);
  const hoje = dataReferencia.startOf("day");
  const anoBase =
    baseEsteAno && hoje.isBefore(dayjs(baseEsteAno), "day")
      ? anoAtual - 1
      : anoAtual;

  const dtInicio = construirDataComAno(anoConcessao.dtBaseInicioConcessao, anoBase);
  const dtFim = construirDataComAno(anoConcessao.dtLimiteConcessao, anoBase + 1);

  return { dtInicio, dtFim, anoBase };
}

export async function getPeriodoConcessao(dataReferencia?: Dayjs) {
  const anoConcessao =
    await concessionariaClient.buscarAnoConcessaoConcessionariaPorIdConcessionaria();

  return calcularPeriodoConcessao(anoConcessao, dataReferencia ?? dayjs());
}
