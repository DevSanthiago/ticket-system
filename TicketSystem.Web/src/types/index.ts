import type { LucideProps } from "lucide-react";
import type { Variants, useAnimation } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import type { IconType } from "react-icons/lib";

/**
 * ==========================================
 * ENUMS GLOBAIS DO SISTEMA
 * ==========================================
 */

export enum Department {
    Automation = 0,
    Setup = 1,
    Test = 2,
    Engineering = 3,
    Production = 4
}

export enum SetupTicketType {
    LineSetup = 0,
    MaterialRequest = 1
}

export enum TestTicketType {
    FinalTest = 0,
    LogFiles = 1
}

export enum TicketStatus {
    Open = 1,
    InProgress = 2,
    Resolved = 3
}

export enum ChecklistStatus {
    NotRequired = 0,
    Pending = 1,
    Completed = 2
}

/**
 * ==========================================
 * USUÁRIOS E AUTENTICAÇÃO
 * ==========================================
 */

export interface User {
    id?: number;
    name?: string;
    email?: string;
    registration?: number;
    department?: string;
    roles?: string[];
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface UserFormDto {
    username: string;
    fullName: string;
    email: string;
    registration: string;
    password?: string;
    role: string;
    resolverDepartment: string;
}

export interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: User | null;
}

/**
 * ==========================================
 * TICKETS (SETUP, TESTE E AUTOMAÇÃO)
 * ==========================================
 */

export interface SetupTicket {
    id: number;
    requesterId: number;
    requesterName?: string;
    targetDepartment: Department;
    setupType: SetupTicketType;
    status: TicketStatus;
    checklistStatus: ChecklistStatus;
    checklistContent?: string;
    lineCategory: number;
    lineName: string;
    product?: string;
    isLineStopped: boolean;
    lineStoppedTime?: string;
    requestedMaterial?: string;
    observation: string;
    description?: string;
    confirmationToken: string;
    ConfirmationToken: string;
    resolverId?: number;
    resolverName?: string;
    createdAt: string;
    startedAt?: string;
    finishedAt?: string;
    StartedAt?: string;
    FinishedAt?: string;
}

export interface TestTicket {
    id: number;
    requesterId: number;
    testType: number;
    status: number;
    confirmationToken?: string;
    ConfirmationToken?: string;
    createdAt: string;
    lineCategory: string;
    requesterName?: string;
    lineName: string;
    observation: string;
    isLineStopped: boolean;
    lineStoppedTime?: string;
    product?: string;
    resolverId?: number;
    resolverName?: string;
    checklistStatus: number;
}

export interface AutomationTicket {
    id: number;
    requesterId: number;
    ticketType: number;
    status: number;
    confirmationToken?: string;
    ConfirmationToken?: string;
    createdAt: string;
    lineCategory: string;
    requesterName?: string;
    lineName: string;
    runningProduct: string;
    observation: string;
    lineSystem?: string;
    systemSupportType?: string;
    toolType?: string;
    labelValidationType?: string;
    produtoProduct?: string;
    resolverId?: number;
    resolverName?: string;
    checklistStatus: number;
    isLineStopped: boolean;
    lineStoppedTime?: string | null;
}

export interface SoftwareTicket {
    id: number;
    requesterId: number;
    status: number;
    sector: string;
    problem: string;
    postLocation: string;
    productionLineId?: number;
    necessaryInfo: string;
    confirmationToken?: string;
    ConfirmationToken?: string;
    createdAt: string;
    requesterName?: string;
    resolverId?: number;
    resolverName?: string;
    isLineStopped?: boolean;
    lineStoppedTime?: string | null;
}

/**
 * ==========================================
 * DATA TRANSFER OBJECTS (DTOs) PARA TICKETS
 * ==========================================
 */

export interface CreateTicketDto {
    requesterId: number;
    setupType: SetupTicketType;
    lineCategory: number;
    lineName: string;
    isLineStopped: boolean;
    lineStoppedTime?: string;
    requestedMaterial?: string;
    observation: string;
}

export interface CreateAutomationTicketsDto {
    productionLineId: number;
    ticketType: number;
    lineCategory: number;
    lineName: string;
    runningProduct: string;
    observation: string;
    lineSystem?: number | null;
    systemSupportType?: number | null;
    toolType?: number | null;
    labelValidationType?: number | null;
    produtoProduct?: string | null;
    product?: string | null;
}

/**
 * ==========================================
 * LINHAS DE PRODUÇÃO E PREFIXOS
 * ==========================================
 */

export interface ProductionLine {
    id: number;
    lineName: string;
    prefix: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    createdByUserName: string;
    updatedByUserName?: string;
}

export interface ProductionLinesByPrefix {
    prefix: string;
    prefixLabel: string;
    lines: ProductionLine[];
}

export interface LinePrefix {
    id: number;
    value: string;
    label: string;
    isActive: boolean;
}

export interface CreateLinePrefixDto {
    value: string;
    label: string;
}

export interface PrefixModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export interface PrefixOption {
    value: string;
    label: string;
}

export interface ProductionLineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    line?: ProductionLine | null;
}

export interface CreateProductionLineDto {
    lineName: string;
    prefix: string;
    description: string | null;
    isActive: boolean;
}

/**
 * ==========================================
 * CHECKLISTS E FORMULÁRIOS
 * ==========================================
 */

export interface ChecklistFormProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: SetupTicket | null;
    currentUser: User | null;
    onSuccess: () => void;
}

export interface ParsedChecklistContent {
    produtoAtual?: string;
    produtoSetup?: string;
    liderLinha?: string;
    observacao?: string;
    checks?: boolean[];
    assinadoPor?: string;
    dataAssinatura?: string;
}

/**
 * ==========================================
 * UI: COMPONENTES, SIDEBAR E CARDS
 * ==========================================
 */

export interface SidebarItemProps {
    icon: ElementType;
    label: string;
    isActive?: boolean;
    children?: ReactNode;
    isSidebarExpanded: boolean;
    onClick?: () => void;
}

export interface SubItemProps {
    label: string;
    icon?: ElementType;
    onClick?: () => void;
}

export interface ActionCardProps {
    title: string;
    description: string;
    subDescription: string;
    icon: ElementType;
    colorScheme: string;
    onClick: () => void;
    extraElement?: ReactNode;
}

export interface DashboardActionCardProps {
    title: string;
    description: string;
    animatedIcon: React.ReactElement<AnimatedIconProps>;
    buttonText: string;
    buttonColor: string;
    onClick: () => void;
}

export interface StatCardProps {
    label: string;
    value: number;
    helpText: string;
    icon?: IconType;
    animatedIcon?: React.ReactElement<AnimatedIconProps>;
    color: string;
}

/**
 * ==========================================
 * FILTROS E ESTATÍSTICAS
 * ==========================================
 */

export interface TicketFilterOption {
    value: number;
    label: string;
    color: string;
    borderColor?: string;
    icon?: IconType;
    darkColor?: string;
    darkBorderColor?: string;
}

export interface TicketStatusOption {
    value: number;
    label: string;
    color: string;
    icon: IconType;
}

export interface TicketSectorOption {
    value: string;
    label: string;
    color: string;
    icon?: IconType;
}

export interface TicketFiltersProps {
    filterMyTickets: boolean;
    setFilterMyTickets: (value: boolean) => void;
    filterTypes: number[];
    setFilterTypes: (value: number[] | ((prev: number[]) => number[])) => void;
    filterStatus: number[];
    setFilterStatus: (value: number[] | ((prev: number[]) => number[])) => void;
    typeOptions?: TicketFilterOption[];
    statusOptions: TicketStatusOption[];
    myTicketsColor?: string;
    filterSectors?: string[];
    setFilterSectors?: (value: string[] | ((prev: string[]) => string[])) => void;
    sectorOptions?: TicketSectorOption[];
    searchTerm?: string;
    setSearchTerm?: (value: string) => void;
}

export interface DashboardStats {
    totalLines: number;
    activeLines: number;
    totalUsers: number;
    totalPrefixes: number;
}

/**
 * ==========================================
 * ÍCONES E ANIMAÇÕES
 * ==========================================
 */

export interface IconProps extends LucideProps {
    size?: number;
    color?: string;
    isHovered?: boolean;
}

export interface AnimatedIconProps extends LucideProps {
    size?: number;
    color?: string;
    isHovered?: boolean;
}

export interface IconWrapperProps {
    children: React.ReactNode;
    controls: ReturnType<typeof useAnimation>;
    size?: number;
    color?: string;
    strokeWidth?: string | number;
    variants?: Variants;
    className?: string;
    style?: React.CSSProperties;
}

export interface UseIconAnimationOptions {
    loop?: boolean;
    loopInterval?: number;
}

/**
 * ==========================================
 * INTEGRAÇÃO WHATSAPP E SERVIÇOS
 * ==========================================
 */

export interface TicketResolverWhatsappTransportProps {
    ticketId: number;
    department: TicketDepartment;
    actionType: TicketActionType;
    buttonText?: string;
}

export interface TicketWhatsappTransportProps {
    ticketId: number;
    department: TicketDepartment;
    onSuccess?: () => void;
}

export interface SupportWhatsappTransportProps {
    type: SupportContactType;
    isFullWidth?: boolean;
}

export interface TransportResponse {
    url: string;
    message: string;
}

export interface TicketTransportResponse {
    url: string;
    message: string;
    ticketId: number;
    department: string;
}

/**
 * ==========================================
 * TEMAS E ESTILIZAÇÃO (CHAKRA UI)
 * ==========================================
 */

export interface SubTheme {
    text: string;
    bg: string;
    border: string;
    iconColor: string;
    buttonHex: string;
    buttonHexDark: string;
}

export interface DepartmentThemeData {
    primary: string;
    badge: string;
    badgeText: string;
    main: SubTheme;
    material?: SubTheme;
    log?: SubTheme;
    systems?: SubTheme;
    tools?: SubTheme;
    badgeBorder?: string;
    emptyStatePrimary?: string;
    attention?: SubTheme;
}

export interface ActionCardTheme {
    topBg: string;
    bottomBg: string;
    iconColor: string;
    badgeBg: string;
    hoverButtonBg: string;
    hoverIconColor: string;
    groupHoverIconColor: string;
    cockpitButtonBg: string;
    cockpitButtonHoverBg: string;
}

/**
 * ==========================================
 * RESPOSTAS DE API E ERROS
 * ==========================================
 */

export interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

export interface TicketActionButtonProps {
    ticket: SetupTicket;
    userRole: string | undefined;
    onClick: () => void;
    isPending: boolean;
    actionButtonOrange: Record<string, unknown>;
    actionButtonBlue: Record<string, unknown>;
}

/**
 * ==========================================
 * ADMIN COCKPIT - ROLES E DEPARTAMENTOS
 * ==========================================
 */

export type RoleOption = string;

export interface DepartmentOption {
    id: number;
    name: string;
}

/**
 * ==========================================
 * TYPES LITERAIS E AUXILIARES
 * ==========================================
 */

export type TicketActionType = "start" | "resolve";
export type SupportContactType = "reset_password" | "request_access";
export type TicketDepartment = "automation" | "setup" | "test" | "software";