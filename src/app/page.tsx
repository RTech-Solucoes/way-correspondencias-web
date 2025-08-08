'use client';

import {useEffect, useState} from 'react';
import {AlertCircleIcon, BarChartIcon, CheckCircleIcon, ClockIcon, Clock3Icon, MoreHorizontalIcon, RefreshCwIcon, XCircleIcon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

export default function DashboardPage() {
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [calendarView, setCalendarView] = useState<'month' | 'week' | 'year'>('month');

	useEffect(() => {
		refreshData();
	}, []);

	const refreshData = () => {
		setLastUpdated(new Date());
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
						<h1 className="text-3xl font-bold text-gray-900 flex items-center">
							<BarChartIcon className="h-8 w-8 mr-3" />
						Dashboard
					</h1>
					<p className="text-gray-500 mt-1">
						Visão geral do sistema e métricas importantes
					</p>
				</div>
				<div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Última atualização: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
          </span>
						<Button variant="outline" size="sm" onClick={refreshData}>
							<RefreshCwIcon className="h-4 w-4 mr-2" />
						Atualizar
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Tasks Overview */}
				<Card className="flex flex-col lg:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Visão Geral de Obrigações</CardTitle>
							<Button variant="ghost" size="sm">
								<MoreHorizontalIcon className="h-4 w-4" />
							</Button>
						</div>
						<CardDescription>Status de todas as obrigações contratuais</CardDescription>
					</CardHeader>
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
 									<Clock3Icon className="h-4 w-4 text-blue-500 mr-2" />
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
 									<AlertCircleIcon className="h-4 w-4 text-yellow-500 mr-2" />
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
								{[
									{ id: 1, title: "4.2.1 - Contrato", status: "concluido", date: "Hoje, 14:30", assignee: "Jurídico" },
									{ id: 2, title: "5.2 - Contrato", status: "pendente", date: "Ontem, 10:15", assignee: "Operação" },
									{ id: 3, title: "Ofício SEI n. 714/2025", status: "em_andamento", date: "17/07, 09:45", assignee: "Meio Ambiente" },
								].map((task) => (
									<div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div className="flex items-center space-x-3">
											<div className={`w-2 h-2 rounded-full ${
												task.status === 'concluido' ? 'bg-green-500' :
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

				{/* Recent Activity */}
				<Card className="flex flex-col">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Atividade Recente</CardTitle>
							<Button variant="ghost" size="sm">
								<MoreHorizontalIcon className="h-4 w-4" />
							</Button>
						</div>
						<CardDescription>Últimas ações no sistema</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{[
								{
									id: 1,
									user: { name: "Maria Silva", avatar: "MS" },
									action: "enviou um novo email",
									time: "há 10 minutos",
									detail: "Relatório de Compliance Q2"
								},
								{
									id: 2,
									user: { name: "João Santos", avatar: "JS" },
									action: "concluiu uma obrigação",
									time: "há 45 minutos",
									detail: "4.2.1 - Contrato"
								},
								{
									id: 3,
									user: { name: "Ana Oliveira", avatar: "AO" },
									action: "adicionou um comentário",
									time: "há 2 horas",
									detail: "Ofício SEI n. 714/2025"
								},
								{
									id: 4,
									user: { name: "Carlos Mendes", avatar: "CM" },
									action: "criou uma nova obrigação",
									time: "há 3 horas",
									detail: "5.3 - Revisão Contratual"
								},
								{
									id: 5,
									user: { name: "Lucia Ferreira", avatar: "LF" },
									action: "atualizou um documento",
									time: "há 5 horas",
									detail: "Política de Compliance v2.1"
								},
							].map((activity) => (
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
						<Button variant="outline" className="w-full">Ver Todo o Histórico</Button>
					</CardFooter>
				</Card>
			</div>

			{/* Calendar and Upcoming Events */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="flex flex-col">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Próximos Prazos</CardTitle>
							<Button variant="ghost" size="sm">
								<MoreHorizontalIcon className="h-4 w-4" />
							</Button>
						</div>
						<CardDescription>Obrigações com vencimento próximo</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[
								{ id: 1, title: "5.2 - Contrato", dueDate: "Hoje, 18:00", status: "pendente" },
								{ id: 2, title: "Ofício SEI n. 714/2025", dueDate: "Amanhã, 14:00", status: "em_andamento" },
								{ id: 3, title: "3.1.2 - Documentação", dueDate: "19/07, 10:00", status: "pendente" },
								{ id: 4, title: "Relatório Trimestral", dueDate: "25/07, 18:00", status: "pendente" },
							].map((deadline) => (
								<div key={deadline.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
									<div className={`w-2 h-2 rounded-full ${
										deadline.status === 'concluido' ? 'bg-green-500' :
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

				<Card className="flex flex-col lg:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Calendário de Obrigações</CardTitle>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCalendarView('month')}
									className={calendarView === 'month' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
								>
									Mês
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCalendarView('week')}
									className={calendarView === 'week' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
								>
									Semana
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCalendarView('year')}
									className={calendarView === 'year' ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
								>
									Ano
								</Button>
							</div>
						</div>
						<CardDescription>Visualize suas obrigações no calendário</CardDescription>
					</CardHeader>
					<CardContent className="h-full">
						<div className="bg-gray-50 rounded-lg p-4 min-h-full overflow-y-auto">
							{calendarView === 'month' && (
								<>
									<div className="grid grid-cols-7 gap-1 text-center mb-2">
										{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
											<div key={day} className="text-xs font-medium text-gray-500">{day}</div>
										))}
									</div>
									<div className="grid grid-cols-7 gap-1">
										{Array.from({ length: 35 }).map((_, index) => {
											const day = index - 5; // Start from previous month
											const isCurrentMonth = day > 0 && day <= 31;
											const isToday = day === 17; // Assuming today is the 17th

											// Sample obligations data
											const obligations = [
												{ day: 17, title: "5.2 - Contrato", status: "pendente" },
												{ day: 18, title: "Ofício SEI n. 714/2025", status: "em_andamento" },
												{ day: 19, title: "3.1.2 - Documentação", status: "pendente" },
												{ day: 25, title: "Relatório Trimestral", status: "pendente" },
												{ day: 10, title: "4.2.1 - Contrato", status: "concluido" },
												{ day: 15, title: "Reunião Mensal", status: "em_andamento" },
											];

											const dayObligations = obligations.filter(o => o.day === day);

											return (
												<div
													key={index}
													className={`p-1 rounded-lg border text-xs h-24 flex flex-col ${
														isCurrentMonth
															? isToday
																? 'bg-blue-50 border-blue-200'
																: 'bg-white border-gray-200'
															: 'bg-gray-100 border-gray-200 text-gray-400'
													}`}
												>
													<div className="font-medium mb-1">{isCurrentMonth ? day : day <= 0 ? day + 30 : day - 31}</div>
													<div className="overflow-y-auto flex-1">
														{dayObligations.map((obligation, i) => (
															<div
																key={i}
																className={`mb-1 p-1 rounded text-xs truncate ${
																	obligation.status === 'concluido' ? 'bg-green-100 text-green-800' :
																		obligation.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
																			obligation.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
																				'bg-red-100 text-red-800'
																}`}
															>
																{obligation.title}
															</div>
														))}
													</div>
												</div>
											);
										})}
									</div>
								</>
							)}

							{calendarView === 'week' && (
								<div className="space-y-2">
									<div className="grid grid-cols-7 gap-1 text-center mb-2">
										{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
											const date = 14 + index; // Starting from Sunday, July 14
											const isToday = date === 17; // Assuming today is the 17th
											return (
												<div
													key={day}
													className={`text-sm font-medium p-2 rounded-t-lg ${
														isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
													}`}
												>
													{day}
													<div className="text-xs mt-1">{date}/07</div>
												</div>
											);
										})}
									</div>
									<div className="grid grid-cols-7 gap-1">
										{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
											const date = 14 + index; // Starting from Sunday, July 14

											// Sample obligations data
											const obligations = [
												{ day: 17, title: "5.2 - Contrato", status: "pendente", time: "10:00" },
												{ day: 18, title: "Ofício SEI n. 714/2025", status: "em_andamento", time: "14:30" },
												{ day: 19, title: "3.1.2 - Documentação", status: "pendente", time: "09:00" },
												{ day: 15, title: "Reunião Mensal", status: "em_andamento", time: "15:00" },
											];

											const dayObligations = obligations.filter(o => o.day === date);

											return (
												<div
													key={day}
													className="bg-white border border-gray-200 rounded-b-lg p-2 h-64 overflow-y-auto"
												>
													{dayObligations.length === 0 ? (
														<div className="text-xs text-gray-400 h-full flex items-center justify-center">
															Sem obrigações
														</div>
													) : (
														dayObligations.map((obligation, i) => (
															<div
																key={i}
																className={`mb-2 p-2 rounded text-xs ${
																	obligation.status === 'concluido' ? 'bg-green-100 text-green-800' :
																		obligation.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
																			obligation.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
																				'bg-red-100 text-red-800'
																}`}
															>
																<div className="font-medium">{obligation.time}</div>
																<div>{obligation.title}</div>
															</div>
														))
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{calendarView === 'year' && (
								<div className="grid grid-cols-4 gap-4">
									{['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
										'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((month, index) => {
										const isCurrentMonth = index === 6; // July is the current month (0-indexed)

										// Sample data for number of obligations per month
										const obligationCounts = [3, 5, 2, 4, 6, 3, 8, 2, 0, 0, 0, 0];

										return (
											<div
												key={month}
												className={`p-3 rounded-lg border ${
													isCurrentMonth ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
												}`}
											>
												<div className="font-medium text-sm mb-2">{month}</div>
												<div className="flex justify-between items-center">
													<div className="text-xs text-gray-500">
														{obligationCounts[index]} obrigações
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}