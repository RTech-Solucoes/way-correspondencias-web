"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kanban, Mail, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EmailClient from "@/components/email/EmailClient";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";

const NAVIGATION_ITEMS = [
	{ id: "dashboard", label: "Dashboard", icon: BarChart, count: 0 },
	{ id: "email", label: "Email", icon: Mail, count: 3 },
	{ id: "kanban", label: "Obrigações Contratuais", icon: Kanban, count: 4 },
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

	const [activeModule, setActiveModule] = useState<"dashboard" | "email" | "kanban">(
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
			case "kanban":
				return <KanbanBoard />;
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
