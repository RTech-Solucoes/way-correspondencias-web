import {Icon as IconType} from "@phosphor-icons/react";

export default function PageTitle ({
  title,
  icon
}: {
  title: string,
  icon: IconType
}) {
  const Icon = icon

  return (
    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
      <Icon className="h-7 w-7 mr-3"/>
      {title}
    </h1>
  )
}
