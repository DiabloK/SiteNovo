import { useState, forwardRef } from "react";
import { NavLink } from "react-router-dom";
import { navbarLinks } from "@/constants";
import { ChevronDown, ChevronRight } from "lucide-react";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";
import { cn } from "@/utils/cn";
import ReportModal from "@/modal/ReportModal";
import FailureModal from "@/modal/FailureModal";
import MaintenanceModal from "@/modal/MaintenanceModal";

const Sidebar = forwardRef(({ collapsed }, ref) => {
  const [openMenus, setOpenMenus] = useState({}); // Estado para abrir/fechar submenus
  const [activeModal, setActiveModal] = useState(null);

  // Função para alternar o submenu
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
      <aside
        ref={ref}
        className={cn(
          "fixed z-[100] flex h-full flex-col overflow-x-hidden border-r border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 transition-all duration-500 ease-in-out",
          collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
          collapsed ? "max-md:-left-full" : "max-md:left-0"
        )}
      >
        <div className="flex items-center gap-x-2 p-2">
          <img src={logoLight} alt="ClientePing" className="dark:hidden w-6 h-6" />
          <img src={logoDark} alt="ClientePing" className="hidden dark:block w-6 h-6" />
          {!collapsed && (
            <p className="text-sm font-medium text-slate-900 transition-colors dark:text-slate-50">
              ClientePing
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
          {navbarLinks.map((section) => (
            <nav key={section.title} className={cn("sidebar-group", collapsed && "md:items-center")}> 
              <p className={cn("sidebar-group-title text-gray-600 dark:text-gray-300 font-semibold text-sm", collapsed && "md:w-[45px]")}>{section.title}</p>
              {section.links.map((link) => (
                link.dropdown ? (
                  <div key={link.label} className="mb-2">
                    <button
                      className="flex items-center w-full p-3 text-left rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white transition-all duration-500 ease-in-out"
                      onClick={() => toggleMenu(link.label)}
                    >
                      {link.icon && <link.icon className="mr-2 h-5 w-5" />} 
                      {!collapsed && <span className="text-gray-800 dark:text-gray-100 font-medium">{link.label}</span>}
                      {openMenus[link.label] ? (
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-500 ease-in-out rotate-180" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-500 ease-in-out" />
                      )}
                    </button>
                    {!collapsed && openMenus[link.label] && link.children && (
                      <div className="ml-4 mt-2 space-y-2 transition-all duration-500 ease-in-out">
                        {link.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => openModal(child.label)}
                            className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white transition-all duration-500 ease-in-out"
                          >
                            {child.icon && <child.icon className="h-5 w-5" />} 
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{child.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.path}
                    className={cn("sidebar-item", collapsed && "md:w-[45px]", "hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600 transition-all duration-500 ease-in-out")}
                  >
                    {link.icon && <link.icon className="mr-2 h-5 w-5" />} 
                    {!collapsed && <span className="text-gray-800 dark:text-gray-100 font-medium">{link.label}</span>}
                  </NavLink>
                )
              ))}
            </nav>
          ))}
        </div>
      </aside>
      
      {activeModal === "Relatório Geral" && <ReportModal isOpen={true} onClose={closeModal} />}
      {activeModal === "Gestão de Falhas" && <FailureModal isOpen={true} onClose={closeModal} />}
      {activeModal === "Manutenções" && <MaintenanceModal isOpen={true} onClose={closeModal} />}
    </>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
