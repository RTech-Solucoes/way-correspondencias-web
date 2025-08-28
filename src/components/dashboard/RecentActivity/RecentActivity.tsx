import { mockUsersEmail } from "@/components/dashboard/MockDados";
import CardHeader from "../card-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

export default function RecentActivity() {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Atividade Recente"
        description="Últimas ações no dia"
      />
      <CardContent>
        <div className="space-y-6">
          {mockUsersEmail.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{activity.user.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>
                  {" "}
                  <span className="text-gray-600">{activity.action}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{activity.detail}</div>
                <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
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