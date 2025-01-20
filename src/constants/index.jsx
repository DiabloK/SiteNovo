import ProfileImage from "@/assets/Manutencao.png";
import ProductImage from "@/assets/product-image.jpg";
import React from "react";
import { fetchDashboardData } from "@/utils/fetchDashboardData";
import {
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  ChartColumn,
  Home,
  NotepadText,
  PackagePlus,
  Settings,
  UserPlus,
  Edit,
  MessageCircle,
  Plus,
  MailWarningIcon
} from "lucide-react";

export const navbarLinks = [
  {
    title: "Dashboard",
    links: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/",
        roles: ["admin", "editor", "eng", "ler"],
      },
    ],
  },
  {
    title: "Cadastro",
    links: [
      {
        label: "Cadastro",
        icon: Plus,
        path: "Cadastro",
        roles: ["admin", "editor", "eng"],
      },
    ],
  },
  {
    title: "Clientes",
    links: [
      {
        label: "Erros de Contatos",
        icon: MailWarningIcon,
        path: "/ClientesErrors",
        roles: ["admin", "editor", "eng", "ler"],
      },
    ],
  },
  {
    title: "Gestão",
    links: [
      {
        label: "Gráficos",
        icon: ChartColumn,
        path: "/Graficos",
        roles: ["admin"],
        children: [
          {
            label: "Gráfico 1",
            path: "/Graficos/1",
          },
          {
            label: "Gráfico 2",
            path: "/Graficos/2",
          },
        ],
      },
      {
        label: "Relatórios",
        icon: NotepadText,
        path: "/Relatorios",
        roles: ["admin", "editor"],
        children: [
          {
            label: "Relatório Geral",
            path: "/Relatorios/Geral",
            roles: ["admin"],
          },
          {
            label: "Gestão de Falhas",
            path: "/Relatorios/Falhas",
            roles: ["admin", "editor"],
          },
          {
            label: "Manutenções",
            path: "/Relatorios/Manutencoes",
            roles: ["admin", "editor"],
          },
        ],
      },
    ],
  },
  {
    title: "Usuários",
    links: [
      {
        label: "Usuário",
        icon: Users,
        path: "/Usuario",
        roles: ["admin", "editor", "eng", "ler"],
      },
      {
        label: "Cadastrar Usuário",
        icon: UserPlus,
        path: "/UsuarioCadastrar",
        roles: ["admin"],
      },
    ],
  },
  {
    title: "Templates",
    links: [
      {
        label: "E-mail - Editar",
        icon: Edit,
        path: "/Templates/Email/Editar",
        roles: ["admin", "editor", "eng"],
      },
      {
        label: "E-mail - Criar Modelo",
        icon: Plus,
        path: "/Templates/Email/Criar",
        roles: ["admin", "editor", "eng"],
      },
      {
        label: "WhatsApp - Editar",
        icon: MessageCircle,
        path: "/Templates/WhatsApp/Editar",
        roles: ["admin", "editor", "eng"],
      },
      {
        label: "WhatsApp - Criar Modelo",
        icon: Plus,
        path: "/Templates/WhatsApp/Criar",
        roles: ["admin", "editor", "eng"],
      },
    ],
  },
];

export const topProducts = [
  {
    number: 1,
    name: "Wireless Headphones",
    image: "@/assets/product-image.jpg",
    description: "High-quality noise-canceling wireless headphones.",
    price: 99.99,
    status: "In Stock",
    rating: 4.5,
  },
];

export const recentSalesData = [
  {
    id: 7,
    name: "Isabella Johnson",
    email: "isabella.johnson@email.com",
    image: "@/assets/Manutencao.png",
    total: 5300,
  },
];

export const overviewData = [
  { name: "Jan", total: 1500 },
  { name: "Feb", total: 2000 },
  { name: "Mar", total: 1000 },
  { name: "Apr", total: 5000 },
  { name: "May", total: 2000 },
  { name: "Jun", total: 5900 },
  { name: "Jul", total: 2000 },
  { name: "Aug", total: 5500 },
  { name: "Sep", total: 2000 },
  { name: "Oct", total: 4000 },
  { name: "Nov", total: 1500 },
  { name: "Dec", total: 2500 },
];

const DashboardPage = ({ counts }) => {
  const containers = [
    { title: "Analise", icon: Activity, value: counts.Analise || 0 },
    { title: "Reagendado/Incompletos", icon: Calendar, value: counts.Reagendado || 0 },
    { title: "Pendete", icon: Clock, value: counts.Pendete || 0 },
    { title: "Ativos", icon: AlertCircle, value: counts.Ativos || 0 },
    { title: "Clientes Afetados", icon: Users, value: counts.ClientesAfetados || 0 },
  ];

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="title">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {containers.map((container, index) => (
          <div key={index} className="card">
            <div className="card-header">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
                <container.icon size={26} />
              </div>
              <p className="card-title">{container.title}</p>
            </div>
            <div className="card-body bg-slate-100">
              <p className="text-3xl font-bold text-slate-900">{container.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const { data } = await fetchDashboardData();
  return {
    props: {
      counts: data,
    },
  };
};

const Index = ({ counts }) => {
  return <DashboardPage counts={counts} />;
};

export default Index;