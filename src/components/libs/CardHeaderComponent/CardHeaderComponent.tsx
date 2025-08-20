import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { ReactNode } from "react";

interface ICardHeader {
  title: string;
  description: string;
  children?: ReactNode
}

export default function CardHeaderComponent(props: ICardHeader) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{props.title}</CardTitle>
        {props.children ? props.children :
          <Button variant="ghost" size="sm">
            <DotsThreeIcon className="h-4 w-4" />
          </Button>
        }
      </div>
      <CardDescription>{props.description}</CardDescription>
    </CardHeader>
  )
}