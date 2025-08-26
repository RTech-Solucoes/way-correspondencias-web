import { obligationsRecent } from "@/components/dashboard/MockDados";
import CardHeader from "../card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircleIcon, ClockIcon, WarningCircleIcon, XCircleIcon } from "@phosphor-icons/react";

export default function TasksStatusBoard() {
  return (
    <Card className="flex flex-col lg:col-span-2">
      <CardHeader
        title="Visão Geral de Obrigações"
        description="Status de todas as obrigações contratuais"
      />
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                <span>Concluídas</span>
              </div>
              <span className="font-medium">8 (44%)</span>
            </div>
            <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: "44%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                <span>Em Andamento</span>
              </div>
              <span className="font-medium">5 (28%)</span>
            </div>
            <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "28%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <WarningCircleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                <span>Pendentes</span>
              </div>
              <span className="font-medium">3 (17%)</span>
            </div>
            <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: "17%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                <span>Atrasadas</span>
              </div>
              <span className="font-medium">2 (11%)</span>
            </div>
            <div className="h-2 bg-gray-100 w-full rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: "11%" }}></div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Obrigações Recentes</h4>
          <div className="space-y-3">
            {obligationsRecent.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'concluido' ? 'bg-green-500' :
                    task.status === 'em_andamento' ? 'bg-blue-500' :
                      task.status === 'pendente' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  <div>
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.assignee} • {task.date}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">Ver</Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <Button variant="outline" className="w-full">Ver Todas as Obrigações</Button>
      </CardFooter>
    </Card>
  )
}