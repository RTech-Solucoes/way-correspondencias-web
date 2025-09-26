import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { ReactNode } from "react";

interface ICardHeader {
  title: string;
  description?: string;
  children?: ReactNode
}

export default function Component(props: ICardHeader) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{props.title}</CardTitle>
      </div>
      <CardDescription>{props.description}</CardDescription>
    </CardHeader>
  )
}