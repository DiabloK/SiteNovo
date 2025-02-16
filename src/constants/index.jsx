import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight
} from "lucide-react";
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
  Wrench,
  ChartArea,
  ChartLine,
} from "lucide-react";

import DropdownMenu from "@/components/DropdownMenu";
import { fetchDashboardData } from "@/utils/fetchDashboardData";

// Importação dos modais
import ReportModal from "@/modal/ReportModal";
import FailureModal from "@/modal/FailureModal";
import MaintenanceModal from "@/modal/MaintenanceModal";
import KpisModal from "@/modal/KpisModal"; // Modal para KPIs

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
        path: "/Graficos",
        roles: ["admin"],
        dropdown: true,
        children: [
          { label: "Dex", path: "/Graficos/Dex", icon: ChartArea },
          { label: "Mapa de Calor", path: "/Graficos/Relatorio", icon: ChartLine },
        ],
      },
      {
        label: "Relatórios",
        icon: NotepadText,
        roles: ["admin", "editor"],
        dropdown: true,
        children: [
          { label: "Relatório Geral", path: "/Relatorios/Geral", icon: FileText, modal: true },
          { label: "Gestão de Falhas", path: "/Relatorios/Falhas", icon: AlertTriangle, modal: true },
          { label: "Manutenções", path: "/Relatorios/Manutencoes", icon: Wrench, modal: true },
          { label: "KPIs -TESTE", path: "/Relatorios/Kpis", icon: Wrench, modal: true },
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
        roles: ["admin", "editor"],
      },
      {
        label: "E-mail - Criar Modelo",
        icon: Plus,
        path: "/Templates/Email/Criar",
        roles: ["admin", "editor"],
      },
      {
        label: "WhatsApp - Editar",
        icon: MessageCircle,
        path: "/Templates/WhatsApp/Editar",
        roles: ["admin", "editor"],
      },
      {
        label: "WhatsApp - Criar Modelo",
        icon: Plus,
        path: "/Templates/WhatsApp/Criar",
        roles: ["admin", "editor"],
      },
    ],
  },
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
      <h1 className="title mb-4 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {containers.map((container) => (
          <div key={container.title} className="card rounded border p-4 shadow">
            <div className="card-header mb-2 flex items-center gap-2">
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

const SidebarLayout = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  // Função para alternar os menus dropdown
  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Função para abrir o modal correto
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <aside className="w-64 bg-gray-800 p-4 text-white">
        {navbarLinks.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 text-sm uppercase text-gray-400">
              {section.title}
            </p>
            {section.links.map((link) =>
              link.dropdown ? (
                <div key={link.label} className="mb-2">
                  <button
                    className="flex w-full items-center rounded-lg p-3 text-left transition-all duration-500 ease-in-out hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600"
                    onClick={() => toggleMenu(link.label)}
                  >
                    {link.icon && <link.icon className="mr-2 h-5 w-5" />}
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {link.label}
                    </span>
                    {openMenus[link.label] ? (
                      <ChevronDown className="ml-auto h-4 w-4 rotate-180 transition-transform duration-500 ease-in-out" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-500 ease-in-out" />
                    )}
                  </button>
                  {openMenus[link.label] && link.children && (
                    <div className="ml-4 mt-2 space-y-2 transition-all duration-500 ease-in-out">
                      {link.children.map((child) =>
                        child.modal ? (
                          <button
                            key={child.label}
                            onClick={() => openModal(child.label)}
                            className="flex w-full items-center gap-2 rounded p-2 transition-all duration-500 ease-in-out hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600"
                          >
                            {child.icon && <child.icon className="h-5 w-5" />}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {child.label}
                            </span>
                          </button>
                        ) : (
                          <NavLink
                            key={child.label}
                            to={child.path}
                            className="flex w-full items-center gap-2 rounded p-2 transition-all duration-500 ease-in-out hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600"
                          >
                            {child.icon && <child.icon className="h-5 w-5" />}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {child.label}
                            </span>
                          </NavLink>
                        )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.path}
                  className="block rounded-lg p-3 transition-all duration-500 ease-in-out hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600"
                >
                  {link.icon && <link.icon className="mr-2 inline h-5 w-5" />}
                  {link.label}
                </NavLink>
              )
            )}
          </div>
        ))}
      </aside>

      {/* Renderização dos modais */}
      {activeModal === "Relatório Geral" && (
        <ReportModal isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "Gestão de Falhas" && (
        <FailureModal isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "Manutenções" && (
        <MaintenanceModal isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "KPIs -TESTE" && (
        <KpisModal isOpen={true} onClose={closeModal} />
      )}
    </>
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
