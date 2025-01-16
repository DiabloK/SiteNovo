import { ChartColumn, Home, NotepadText, Package, PackagePlus, Settings, ShoppingBag, UserCheck, UserPlus, Users } from "lucide-react";

import ProfileImage from "@/assets/Manutencao.png";
import ProductImage from "@/assets/product-image.jpg";

export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/",
            },
            {
                label: "Cadastro",
                icon: ChartColumn,
                path: "/Cadastro",
            },
        ],
    },
    {
        title: "Products",
        links: [
            {
                label: "Graficos",
                icon: ChartColumn,
                path: "/Graficos",
            },
            {
                label: "Relatorios",
                icon: NotepadText,
                path: "/Relatorios",
            },
        ],
    },
    {
        title: "Usuarios",
        links: [
            {
                label: "Usuarios",
                icon: Users,
                path: "/Usuarios",
            },
            {
                label: "Novo Usuario",
                icon: UserPlus,
                path: "/novo-usuario",
            },
        ],
    },
    {
        title: "Configurações",
        links: [
            {
                label: "Configurações",
                icon: Settings,
                path: "/Configurações",
            },
        ],
    },
];
export const topProducts = [
    {
        number: 1,
        name: "Wireless Headphones",
        image: ProductImage,
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
        image: ProfileImage,
        total: 5300,
    },
];


export const overviewData = [
    {
        name: "Jan",
        total: 1500,
    },
    {
        name: "Feb",
        total: 2000,
    },
    {
        name: "Mar",
        total: 1000,
    },
    {
        name: "Apr",
        total: 5000,
    },
    {
        name: "May",
        total: 2000,
    },
    {
        name: "Jun",
        total: 5900,
    },
    {
        name: "Jul",
        total: 2000,
    },
    {
        name: "Aug",
        total: 5500,
    },
    {
        name: "Sep",
        total: 2000,
    },
    {
        name: "Oct",
        total: 4000,
    },
    {
        name: "Nov",
        total: 1500,
    },
    {
        name: "Dec",
        total: 2500,
    },
];