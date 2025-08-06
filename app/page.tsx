"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, BarChart, FileText, Building2, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EmailClient from "@/components/email/EmailClient";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import TemasTable from "@/components/temas/TemasTable";
import AreasTable from "@/components/areas/AreasTable";
import ResponsaveisTable from "@/components/responsaveis/ResponsaveisTable";
import SolicitacoesTable from "@/components/solicitacoes/SolicitacoesTable";
import SolicitacoesKanban from "@/components/solicitacoes/SolicitacoesKanban";

const NAVIGATION_ITEMS = [
	{ id: "dashboard", label: "Dashboard", icon: BarChart, count: 0 },
	{ id: "email", label: "Email", icon: Mail, count: 3 },
	{ id: "temas", label: "Temas", icon: FileText, count: 0 },
	{ id: "areas", label: "Áreas", icon: Building2, count: 0 },
	{ id: "responsaveis", label: "Responsáveis", icon: Users, count: 0 },
	{ id: "solicitacoes", label: "Solicitações", icon: ClipboardList, count: 5 },
];

export default function HomePage() {
	const [mounted, setMounted] = useState(false);
	const [user, setUser] = useState<{ nm_responsavel: string; email: string } | undefined>(
		undefined
	);
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);

	const [activeModule, setActiveModule] = useState<"dashboard" | "email" | "temas" | "areas" | "responsaveis" | "solicitacoes" | "solicitacoes-kanban">(
		"dashboard"
	);
	const [sidebarOpen, setSidebarOpen] = useState(true);

	if (!mounted) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Carregando...</p>
				</div>
			</div>
		);
	}

	const renderActiveModule = () => {
		switch (activeModule) {
			case "dashboard":
				return <Dashboard />;
			case "email":
				return <EmailClient />;
			case "temas":
				return <TemasTable />;
			case "areas":
				return <AreasTable />;
			case "responsaveis":
				return <ResponsaveisTable />;
			case "solicitacoes":
				return <SolicitacoesTable />;
			case "solicitacoes-kanban":
				return <SolicitacoesKanban />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<main
				className={cn(
					"flex flex-row min-w-0 transition-all duration-300 ease-in-out max-h-screen",
					"w-full h-full"
				)}
			>
				<Sidebar
					navigationItems={NAVIGATION_ITEMS}
					activeModule={activeModule}
					onModuleChange={setActiveModule}
					user={user}
				/>
				<div className="flex flex-col w-full overflow-auto min-h-screen">
					{renderActiveModule()}
				</div>
			</main>
		</div>
	);
}
