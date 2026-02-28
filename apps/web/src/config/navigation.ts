export type MenuIconKey = 'users' | 'profile' | 'workspace' | 'settings' | 'menu' | 'close' | 'chevron'

export interface MenuItemConfig {
  label: string
  href: string
  icon?: MenuIconKey
}

export interface MenuSectionConfig {
  id: string
  label: string
  icon: MenuIconKey
  items: MenuItemConfig[]
}

export interface MenuUiConfig {
  sidebarBackgroundClass: string
  topbarBackgroundClass: string
  sectionTextClass: string
  subMenuTextClass: string
  sectionHoverClass: string
  subMenuHoverClass: string
  activeSubMenuClass: string
  borderClass: string
  menuIconClass: string
  sidebarToggleIcon: MenuIconKey
  mobileOpenIcon: MenuIconKey
  mobileCloseIcon: MenuIconKey
  sectionExpandIcon: MenuIconKey
}

export const menuSections: MenuSectionConfig[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    icon: 'workspace',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'workspace',
      },
      {
        label: 'Customers',
        href: '/customers',
        icon: 'users',
      },
      {
        label: 'Preferences',
        href: '/preferences',
        icon: 'profile',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    items: [
      {
        label: 'Profile Setup',
        href: '/preferences',
        icon: 'profile',
      },
    ],
  },
]

export const menuUiConfig: MenuUiConfig = {
  sidebarBackgroundClass: 'bg-white',
  topbarBackgroundClass: 'bg-white',
  sectionTextClass: 'text-gray-800',
  subMenuTextClass: 'text-gray-600',
  sectionHoverClass: 'hover:bg-indigo-50 hover:text-indigo-700',
  subMenuHoverClass: 'hover:bg-gray-100 hover:text-gray-900',
  activeSubMenuClass: 'bg-indigo-100 text-indigo-800',
  borderClass: 'border-gray-200',
  menuIconClass: 'text-gray-700',
  sidebarToggleIcon: 'menu',
  mobileOpenIcon: 'menu',
  mobileCloseIcon: 'close',
  sectionExpandIcon: 'chevron',
}
