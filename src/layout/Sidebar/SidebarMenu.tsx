import * as Icons from 'tabler-icons-react';
import {HkBadge} from '@/components/@hk-badge/@hk-badge';
import ModuleLayout from '../Module/ModuleLayout';

export const SidebarMenu = [
    {
        group: '',
        contents: [
            {
                name: 'Dashboard',
                icon: <Icons.Template />,
                path: '/dashboard',
                badge: <HkBadge size="sm" bg="pink" soft className="ms-auto" >hot</HkBadge>
            },
        ]
    },
    {
        group: 'Apps',
        contents: [
            {
                id: 'inventory',
                name: 'Item & Inventory',
                icon: <Icons.Package />,
                path: '/inventory',
                element: <ModuleLayout />,
                handle: {
                    module: 'inventory',
                },
            },
            {
                id: 'sales',
                name: 'Sales',
                icon: <Icons.ShoppingCart />,
                path: '/sales',
                element: <ModuleLayout />,
                handle: {
                    module: 'sales',
                },
            },
            {
                id: 'purchases',
                name: 'Purchases',
                icon: <Icons.Truck />,
                path: '/purchases',
                element: <ModuleLayout />,
                handle: {
                    module: 'purchases',
                },
            },
            {
                id: 'gl',
                name: 'General Ledger',
                icon: <Icons.Notebook />,
                path: '/gl',
                element: <ModuleLayout />,
                handle: {
                    module: 'gl',
                },
            },
            {
                id: 'einvoice',
                name: 'E-Invoice',
                icon: <Icons.FileInvoice />,
                path: '/einvoice',
                element: <ModuleLayout />,
                handle: {
                    module: 'einvoice',
                },
            },
            /* {
                id: "dash_scrumboard",
                name: 'Scrumboard',
                icon: <Icons.LayoutKanban />,
                path: '/apps/taskboard',
                iconBadge: <HkBadge bg="primary" size="sm" pill className="position-top-end-overflow">3</HkBadge>,
                childrens: [
                    {
                        name: 'All Boards',
                        path: '/apps/taskboard/projects-board',
                        grp_name: "apps",
                    },
                    {
                        name: 'Project Kanban',
                        path: '/apps/taskboard/kanban-board',
                        grp_name: "apps",
                    },
                    {
                        name: 'Pipeline Kanban',
                        path: '/apps/taskboard/pipeline',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_task",
                name: 'Todo',
                icon: <Icons.ListDetails />,
                path: '/apps/todo',
                badge: <HkBadge bg="success" soft className="ms-2">2</HkBadge>,
                childrens: [
                    {
                        name: 'Tasklist',
                        path: '/apps/todo/task-list',
                        grp_name: "apps",
                    },
                    {
                        name: 'Gantt',
                        path: '/apps/todo/gantt',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_blog",
                name: 'Blog',
                icon: <Icons.Browser />,
                path: '/apps/blog',
                childrens: [
                    {
                        name: 'Posts',
                        path: '/apps/blog/posts',
                        grp_name: "apps",
                    },
                    {
                        name: 'Add New Post',
                        path: '/apps/blog/add-new-post',
                        grp_name: "apps",
                    },
                    {
                        name: 'Post Detail',
                        path: '/apps/blog/post-detail',
                        grp_name: "apps",
                    },
                ]
            },
            {
                id: "dash_invoice",
                name: 'Invoices',
                icon: <Icons.FileDigit />,
                path: '/apps/invoices',
                childrens: [
                    {
                        name: 'Invoice List',
                        path: '/apps/invoices/invoice-list',
                        grp_name: "apps",
                    },
                    {
                        name: 'Invoice Templates',
                        path: '/apps/invoices/invoice-templates',
                        grp_name: "apps",
                    },
                    {
                        name: 'Create Invoice',
                        path: '/apps/invoices/create-invoice',
                        grp_name: "apps",
                    },
                    {
                        name: 'Invoice Preview',
                        path: '/apps/invoices/invoice-preview',
                        grp_name: "apps",
                    },
                ]
            }, */
        ]
    },

    {
        group: 'Settings',
        contents: [
            {
                id: "settings_overview",
                name: 'Overview',
                icon: <Icons.LayoutGrid />,
                path: '/settings',
                exact: true,
            },
            /* {
                id: "settings_organization",
                name: 'Organization',
                icon: <Icons.Home />,
                path: '/settings/organization',
                element: <ModuleLayout />,
                handle: {
                    module: 'settings_organization',
                },
            },
            {
                id: "settings_sales",
                name: 'Sales',
                icon: <Icons.TrendingUp />,
                path: '/settings/sales',
                element: <ModuleLayout />,
                handle: {
                    module: 'settings_sales',
                },
            },
            {
                id: "settings_inventory",
                name: 'Inventory',
                icon: <Icons.Box />,
                path: '/settings/inventory',
                element: <ModuleLayout />,
                handle: {
                    module: 'settings_inventory',
                },
            },
            {
                id: "settings_banking",
                name: 'Banking',
                icon: <Icons.BuildingBank />,
                path: '/settings/banking',
                element: <ModuleLayout />,
                handle: {
                    module: 'settings_banking',
                },
            },
            {
                id: "settings_gl",
                name: 'General Ledger',
                icon: <Icons.Book />,
                path: '/settings/gl',
                element: <ModuleLayout />,
                handle: {
                    module: 'settings_gl',
                },
            },
            {
                id: "settings_taxes",
                name: 'Taxes',
                icon: <Icons.Percentage />,
                path: '/settings/taxes',
                element: <ModuleLayout />,
                handle: {
                    module: 'settings_taxes',
                },
            },
            {
                id: "dash_profile",
                name: 'Profile',
                icon: <Icons.UserSearch />,
                path: '/pages',
                badgeIndicator: <HkBadge bg="danger" indicator className="position-absolute top-0 start-100" />,
                childrens: [
                    {
                        name: 'Profile',
                        path: '/pages/profile',
                        grp_name: "apps",
                    },
                    {
                        name: 'Edit Profile',
                        path: '/pages/edit-profile',
                        grp_name: "apps",
                    },
                    {
                        name: 'Account',
                        path: '/pages/account',
                        grp_name: "apps",
                    },
                ]
            }, */
        ]
    },
    {
        group: 'Documentation',
        contents: [
            {
                name: 'Documentation',
                icon: <Icons.FileCode2 />,
                path: 'https://nubra-ui-react.netlify.app/introduction',
            },
            {
                name: 'Components',
                icon: <Icons.Layout />,
                path: 'https://nubra-ui-react.netlify.app/avatar',
            },
        ]
    },

]