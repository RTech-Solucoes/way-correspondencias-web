import Image from "next/image";

export default function Header ({
  logoSrc,
  title,
  subtitle
} : {
  logoSrc: string,
  title: string,
  subtitle: string,
}) {
  return (
    <div className="flex justify-start gap-3 p-6 border-b border-gray-200">
      <Image
        src={logoSrc}
        alt="Logo"
        width={400}
        height={221}
        className="h-11 w-auto"
      />
      <div className="items-start whitespace-nowrap">
        <h1 className="w-fit text-xl font-bold text-gray-900">{title}</h1>
        <p className="w-fit text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}