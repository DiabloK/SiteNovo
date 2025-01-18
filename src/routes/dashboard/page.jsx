import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { overviewData, recentSalesData, topProducts } from "@/constants";
import { Footer } from "@/layouts/footer";
import {
    CreditCard,
    DollarSign,
    Package,
    PencilLine,
    Star,
    Trash,
    TrendingUp,
    Users,
    Clock,
    ClockAlert,
    Activity,
    Calendar,
    AlertCircle,
    CalendarPlus,
} from "lucide-react";

const DashboardPage = ({ counts = {} }) => {
    const containers = [
        { title: "Analise", icon: Activity, value: counts.Analise || 0 },
        { title: "Reagendado/Incompletos", icon: Calendar, value: counts.Reagendado || 0 },
        { title: "Pendente", icon: Clock, value: counts.Pendete || 0 },
        { title: "Ativos", icon: AlertCircle, value: counts.Ativos || 0 },
        { title: "Clientes Afetados", icon: Users, value: counts.ClientesAfetados || 0 },
    ];

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {containers.map((container, index) => (
                    <div
                        key={index}
                        className="card"
                    >
                        <div className="card-header">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <container.icon size={26} />
                            </div>
                            <p className="card-title">{container.title}</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{container.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Lista</p>
                </div>
                <div className="card-body p-0">
                    <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">#</th>
                                    <th className="table-head">Product</th>
                                    <th className="table-head">Price</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Rating</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {topProducts.map((product) => (
                                    <tr
                                        key={product.number}
                                        className="table-row"
                                    >
                                        <td className="table-cell">{product.number}</td>
                                        <td className="table-cell">
                                            <div className="flex w-max gap-x-4">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-14 rounded-lg object-cover"
                                                />
                                                <div className="flex flex-col">
                                                    <p>{product.name}</p>
                                                    <p className="font-normal text-slate-600 dark:text-slate-400">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">${product.price}</td>
                                        <td className="table-cell">{product.status}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-2">
                                                <Star
                                                    size={18}
                                                    className="fill-yellow-600 stroke-yellow-600"
                                                />
                                                {product.rating}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-4">
                                                <button className="text-blue-500 dark:text-blue-600">
                                                    <PencilLine size={20} />
                                                </button>
                                                <button className="text-red-500">
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="card-header">
                        <p className="card-title">Log Recentes</p>
                    </div>
                    <div className="card-body h-[300px] overflow-auto p-0">
                        {recentSalesData.map((sale) => (
                            <div
                                key={sale.id}
                                className="flex items-center justify-between gap-x-4 py-2 pr-2"
                            >
                                <div className="flex items-center gap-x-4">
                                    <img
                                        src={sale.image}
                                        alt={sale.name}
                                        className="size-10 flex-shrink-0 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col gap-y-2">
                                        <p className="font-medium text-slate-900 dark:text-slate-50">{sale.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{sale.email}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-slate-900 dark:text-slate-50">${sale.total}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardPage;
