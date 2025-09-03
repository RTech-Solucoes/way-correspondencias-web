import {deadlines} from "@/components/dashboard/MockDados";
import CardHeader from "../card-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {ClockIcon} from "@phosphor-icons/react";

export default function NextDeadlines() {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Próximos Prazos"
        description="Obrigações com vencimento próximo"
      />
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${deadline.status === 'concluido' ? 'bg-green-500' :
                deadline.status === 'em_andamento' ? 'bg-blue-500' :
                  deadline.status === 'pendente' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{deadline.title}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {deadline.dueDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <Button variant="outline" className="w-full">Ver Todos os Prazos</Button>
      </CardFooter>
    </Card>
  )
}