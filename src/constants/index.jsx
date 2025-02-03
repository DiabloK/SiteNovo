import React from "react";
import { Link, useLocation, useMatch } from "react-router-dom";
import {
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  ChartColumn,
  Home,
  NotepadText,
  UserPlus,
  Edit,
  MessageCircle,
  Plus,
  MailWarningIcon,
  FileText,
  AlertTriangle,
  Wrench
} from "lucide-react";

import DropdownMenu from "@/components/DropdownMenu";
import { fetchDashboardData } from "@/utils/fetchDashboardData";

// Dados dos links da sidebar
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
        path: "/Cadastro",
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
        path: "Graficos",
        roles: ["admin"],
        dropdown: true,
        children: [
          { label: "Dex", path: "/Graficos/Dex" },
          { label: "Grafico Ano", path: "/Graficos/2" },
          { label: "Gráfico Mes", path: "/Graficos/3" },
        ],
      },
      {
        label: "Relatórios",
        icon: NotepadText, 
        dropdown: true,
        children: [
          { label: "Relatório Geral", path: "/Relatorios/Geral", icon: FileText },
          { label: "Gestão de Falhas", path: "/Relatorios/Falhas", icon: AlertTriangle },
          { label: "Manutenções", path: "/Relatorios/Manutencoes", icon: Wrench },
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

// Componente do Dashboard com os cartões
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
      <h1 className="title text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {containers.map((container) => (
          <div key={container.title} className="card border rounded p-4 shadow">
            <div className="card-header flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500">
                <container.icon size={26} />
              </div>
              <p className="card-title font-semibold">{container.title}</p>
            </div>
            <div className="card-body bg-slate-100 p-2">
              <p className="text-3xl font-bold text-slate-900">{container.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Layout principal que une a sidebar e o conteúdo principal, incluindo o sub menu de gráficos
const SidebarLayout = ({ counts }) => {
  const location = useLocation();
  // Verifica se a rota bate com /Graficos/*
  const isGraphRoute = useMatch("/Graficos/*");

  // Se estivermos em uma rota de gráficos, procura os links filhos do menu "Gráficos"
  let graphSubLinks = [];
  if (isGraphRoute) {
    const gestaoSection = navbarLinks.find((section) => section.title === "Gestão");
    if (gestaoSection) {
      const graficosLink = gestaoSection.links.find((link) => link.label === "Gráficos");
      if (graficosLink && graficosLink.children) {
        graphSubLinks = graficosLink.children;
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Principal */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        {navbarLinks.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 text-sm uppercase text-gray-400">{section.title}</p>
            {section.links.map((link) =>
              link.dropdown ? (
                <DropdownMenu key={link.label} label={link.label} icon={link.icon}>
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.path}
                      className="block rounded p-2 hover:bg-gray-200"
                    >
                      {child.label}
                    </Link>
                  ))}
                </DropdownMenu>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  className="block rounded-lg p-3 hover:bg-gray-700"
                >
                  <link.icon className="mr-2 inline h-5 w-5" />
                  {link.label}
                </Link>
              )
            )}
          </div>
        ))}
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 p-6">
        <DashboardPage counts={counts} />

        {/* Sub Sidebar para Gráficos */}
        {isGraphRoute && graphSubLinks.length > 0 && (
          <div className="mt-8 p-4 border-t border-gray-300">
            <h2 className="mb-4 text-lg font-semibold">Opções de Gráficos</h2>
            <ul className="space-y-2">
              {graphSubLinks.map((subLink) => (
                <li key={subLink.label}>
                  <Link
                    to={subLink.path}
                    className="block rounded p-2 hover:bg-gray-200"
                  >
                    {subLink.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

// Data fetching do lado do servidor (ajuste conforme seu framework)
export const getServerSideProps = async () => {
  const { data } = await fetchDashboardData();
  return {
    props: {
      counts: data,
    },
  };
};

export default SidebarLayout;
