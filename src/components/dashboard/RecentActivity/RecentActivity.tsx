import { mockUsersEmail } from "@/components/dashboard/MockDados";
import CardHeader from "../card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";
import dashboardClient from "@/api/dashboard/client";
import { toast } from "sonner";
import { IRecentActivity } from "@/api/dashboard/type";

export default function RecentActivity() {

  const [listActivity, setListActivity] = useState<IRecentActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardClient.getRecentActivity(0);
        setListActivity(data);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
        toast.error("Não foi possível carregar as atividades recentes.");
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Atividade Recente"
        description="Últimas ações no dia"
      />
      <CardContent>
        <div className="space-y-6">
          {listActivity.map((activity, index) => (
            <div key={activity.id || `activity-${index}`} className="flex items-start space-x-3">
              <div>
                <div className="text-sm">
                  <span className="text-base font-bold">{activity.nmTema}: </span>
                  <span className="text-gray-600">{activity.dsAssunto}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{activity.tempoDecorrido}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <Button variant="outline" className="w-full">Ver mais</Button>
      </CardFooter>
    </Card>
  )
}