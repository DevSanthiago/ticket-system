using System.Text;
using TicketSystem.API.Enums;
using TicketSystem.API.Models;

namespace TicketSystem.API.Utils
{
    public static class TicketMessageHelper
    {
        public static string BuildAutomationMessage(AutomationTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("🤖 *TICKET DE AUTOMAÇÃO*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "Requester não encontrado"}");
            sb.AppendLine($"├─ Tipo: {FormatAutomationType(ticket.TicketType)}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine($"├─ Token Único: {ticket.ConfirmationToken}");
            sb.AppendLine();

            AppendCommonLineInfo(sb, ticket.LineCategory, ticket.LineName, ticket.Product);

            sb.AppendLine($"├─ Produto em Produção: {ticket.RunningProduct}");

            if (ticket.LineSystem.HasValue)
                sb.AppendLine($"├─ Sistema da Linha: {FormatLineSystem(ticket.LineSystem)}");

            if (ticket.SystemSupportType.HasValue)
                sb.AppendLine($"├─ Tipo de Suporte: {FormatSystemSupport(ticket.SystemSupportType)}");

            if (ticket.ToolType.HasValue)
                sb.AppendLine($"├─ Tipo de Ferramenta: {FormatToolType(ticket.ToolType)}");

            if (ticket.LabelValidationType.HasValue)
                sb.AppendLine($"├─ Tipo de Validação: {FormatLabelValidation(ticket.LabelValidationType)}");

            if (!string.IsNullOrEmpty(ticket.ProductModel))
                sb.AppendLine($"├─ Produto Product: {ticket.ProductModel}");

            AppendObservationAndDate(sb, ticket.Observation, ticket.CreatedAt);

            return sb.ToString();
        }

        public static string BuildAutomationStartMessage(AutomationTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("✅ *TICKET ASSUMIDO - AUTOMAÇÃO*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO TICKET*");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "N/A"}");
            sb.AppendLine($"├─ Tipo: {FormatAutomationType(ticket.TicketType)}");
            sb.AppendLine($"├─ Linha: {ticket.LineName} ({FormatLineCategory(ticket.LineCategory)})");
            sb.AppendLine($"├─ Produto em Produção: {ticket.RunningProduct}");

            if (!string.IsNullOrEmpty(ticket.Product))
                sb.AppendLine($"├─ Produto: {ticket.Product}");

            if (ticket.LineSystem.HasValue)
                sb.AppendLine($"├─ Sistema da Linha: {FormatLineSystem(ticket.LineSystem)}");

            if (ticket.SystemSupportType.HasValue)
                sb.AppendLine($"├─ Tipo de Suporte: {FormatSystemSupport(ticket.SystemSupportType)}");

            if (ticket.ToolType.HasValue)
                sb.AppendLine($"├─ Tipo de Ferramenta: {FormatToolType(ticket.ToolType)}");

            if (ticket.LabelValidationType.HasValue)
                sb.AppendLine($"├─ Tipo de Validação: {FormatLabelValidation(ticket.LabelValidationType)}");

            if (!string.IsNullOrEmpty(ticket.ProductModel))
                sb.AppendLine($"├─ Produto Product: {ticket.ProductModel}");

            sb.AppendLine();
            sb.AppendLine("⏰ *TIMELINE*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"└─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (!string.IsNullOrWhiteSpace(ticket.Observation))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *OBSERVAÇÃO DO SOLICITANTE*");
                sb.AppendLine(ticket.Observation);
            }

            return sb.ToString();
        }

        public static string BuildAutomationResolveMessage(AutomationTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("🎯 *TICKET FINALIZADO - AUTOMAÇÃO*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO ATENDIMENTO*");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "N/A"}");
            sb.AppendLine($"├─ Tipo: {FormatAutomationType(ticket.TicketType)}");
            sb.AppendLine($"├─ Linha: {ticket.LineName} ({FormatLineCategory(ticket.LineCategory)})");
            sb.AppendLine($"├─ Produto em Produção: {ticket.RunningProduct}");

            if (!string.IsNullOrEmpty(ticket.Product))
                sb.AppendLine($"├─ Produto: {ticket.Product}");

            if (ticket.LineSystem.HasValue)
                sb.AppendLine($"├─ Sistema da Linha: {FormatLineSystem(ticket.LineSystem)}");

            if (ticket.SystemSupportType.HasValue)
                sb.AppendLine($"├─ Tipo de Suporte: {FormatSystemSupport(ticket.SystemSupportType)}");

            if (ticket.ToolType.HasValue)
                sb.AppendLine($"├─ Tipo de Ferramenta: {FormatToolType(ticket.ToolType)}");

            if (ticket.LabelValidationType.HasValue)
                sb.AppendLine($"├─ Tipo de Validação: {FormatLabelValidation(ticket.LabelValidationType)}");

            if (!string.IsNullOrEmpty(ticket.ProductModel))
                sb.AppendLine($"├─ Produto Product: {ticket.ProductModel}");

            sb.AppendLine();
            sb.AppendLine("⏱️ *TEMPO DE ATENDIMENTO*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"├─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");
            sb.AppendLine($"└─ Finalizado em: {(ticket.FinishedAt.HasValue ? ToBrasiliaTime(ticket.FinishedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (ticket.StartedAt.HasValue && ticket.FinishedAt.HasValue)
            {
                var duration = ticket.FinishedAt.Value - ticket.StartedAt.Value;
                sb.AppendLine();
                sb.AppendLine($"⏲️ Duração do Atendimento: {FormatDuration(duration)}");
            }

            if (!string.IsNullOrWhiteSpace(ticket.Observation))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *OBSERVAÇÃO DO SOLICITANTE*");
                sb.AppendLine(ticket.Observation);
            }

            return sb.ToString();
        }

        public static string BuildSetupMessage(SetupTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("🔧 *TICKET DE SETUP*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "Requester não encontrado"}");
            sb.AppendLine($"├─ Tipo: {FormatSetupType(ticket.SetupType)}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine($"├─ Token Único: {ticket.ConfirmationToken}");
            sb.AppendLine();

            AppendCommonLineInfo(sb, ticket.LineCategory, ticket.LineName, ticket.Product);

            sb.AppendLine($"├─ Linha Parada: {(ticket.IsLineStopped ? "Sim" : "Não")}");

            if (ticket.IsLineStopped && !string.IsNullOrEmpty(ticket.LineStoppedTime))
                sb.AppendLine($"├─ Tempo de Parada: {ticket.LineStoppedTime}");

            if (!string.IsNullOrEmpty(ticket.RequestedMaterial))
                sb.AppendLine($"├─ Material Solicitado: {ticket.RequestedMaterial}");

            AppendObservationAndDate(sb, ticket.Observation, ticket.CreatedAt);

            return sb.ToString();
        }

        public static string BuildSetupStartMessage(SetupTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("✅ *TICKET ASSUMIDO - SETUP*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO TICKET*");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "N/A"}");
            sb.AppendLine($"├─ Tipo: {FormatSetupType(ticket.SetupType)}");
            sb.AppendLine($"├─ Linha: {ticket.LineName} ({FormatLineCategory(ticket.LineCategory)})");

            if (!string.IsNullOrEmpty(ticket.Product))
                sb.AppendLine($"├─ Produto: {ticket.Product}");

            sb.AppendLine($"├─ Linha Parada: {(ticket.IsLineStopped ? "Sim ⚠️" : "Não")}");

            if (ticket.IsLineStopped && !string.IsNullOrEmpty(ticket.LineStoppedTime))
                sb.AppendLine($"├─ Tempo de Parada: {ticket.LineStoppedTime}");

            if (!string.IsNullOrEmpty(ticket.RequestedMaterial))
                sb.AppendLine($"├─ Material Solicitado: {ticket.RequestedMaterial}");

            sb.AppendLine();
            sb.AppendLine("⏰ *TIMELINE*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"└─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (!string.IsNullOrWhiteSpace(ticket.Observation))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *OBSERVAÇÃO DO SOLICITANTE*");
                sb.AppendLine(ticket.Observation);
            }

            return sb.ToString();
        }

        public static string BuildSetupResolveMessage(SetupTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("🎯 *TICKET FINALIZADO - SETUP*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO ATENDIMENTO*");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "N/A"}");
            sb.AppendLine($"├─ Tipo: {FormatSetupType(ticket.SetupType)}");
            sb.AppendLine($"├─ Linha: {ticket.LineName} ({FormatLineCategory(ticket.LineCategory)})");

            if (!string.IsNullOrEmpty(ticket.Product))
                sb.AppendLine($"├─ Produto: {ticket.Product}");

            sb.AppendLine($"├─ Linha Estava Parada: {(ticket.IsLineStopped ? "Sim" : "Não")}");

            if (ticket.IsLineStopped && !string.IsNullOrEmpty(ticket.LineStoppedTime))
                sb.AppendLine($"├─ Tempo de Parada: {ticket.LineStoppedTime}");

            if (!string.IsNullOrEmpty(ticket.RequestedMaterial))
                sb.AppendLine($"├─ Material Solicitado: {ticket.RequestedMaterial}");

            sb.AppendLine();
            sb.AppendLine("⏱️ *TEMPO DE ATENDIMENTO*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"├─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");
            sb.AppendLine($"└─ Finalizado em: {(ticket.FinishedAt.HasValue ? ToBrasiliaTime(ticket.FinishedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (ticket.StartedAt.HasValue && ticket.FinishedAt.HasValue)
            {
                var duration = ticket.FinishedAt.Value - ticket.StartedAt.Value;
                sb.AppendLine();
                sb.AppendLine($"⏲️ Duração do Atendimento: {FormatDuration(duration)}");
            }

            if (ticket.ChecklistStatus == ChecklistStatus.Pending)
            {
                sb.AppendLine();
                sb.AppendLine("📋 *CHECKLIST*");
                sb.AppendLine("⚠️ Checklist pendente - Aguardando preenchimento pelo requester");
            }

            if (!string.IsNullOrWhiteSpace(ticket.Observation))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *OBSERVAÇÃO DO SOLICITANTE*");
                sb.AppendLine(ticket.Observation);
            }

            return sb.ToString();
        }

        public static string BuildTestMessage(TestTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("✅ *TICKET DE TESTE*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "Requester não encontrado"}");
            sb.AppendLine($"├─ Tipo: {FormatTestType(ticket.TestType)}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine($"├─ Token Único: {ticket.ConfirmationToken}");
            sb.AppendLine();

            AppendCommonLineInfo(sb, ticket.LineCategory, ticket.LineName, ticket.Product);

            sb.AppendLine($"├─ Linha Parada: {(ticket.IsLineStopped ? "Sim" : "Não")}");

            if (ticket.IsLineStopped && !string.IsNullOrEmpty(ticket.LineStoppedTime))
                sb.AppendLine($"├─ Tempo de Parada: {ticket.LineStoppedTime}");

            AppendObservationAndDate(sb, ticket.Observation, ticket.CreatedAt);

            return sb.ToString();
        }

        public static string BuildTestStartMessage(TestTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("✅ *TICKET ASSUMIDO - TESTE*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO TICKET*");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "N/A"}");
            sb.AppendLine($"├─ Tipo: {FormatTestType(ticket.TestType)}");
            sb.AppendLine($"├─ Linha: {ticket.LineName} ({FormatLineCategory(ticket.LineCategory)})");

            if (!string.IsNullOrEmpty(ticket.Product))
                sb.AppendLine($"├─ Produto: {ticket.Product}");

            sb.AppendLine($"├─ Linha Parada: {(ticket.IsLineStopped ? "Sim ⚠️" : "Não")}");

            if (ticket.IsLineStopped && !string.IsNullOrEmpty(ticket.LineStoppedTime))
                sb.AppendLine($"├─ Tempo de Parada: {ticket.LineStoppedTime}");

            sb.AppendLine();
            sb.AppendLine("⏰ *TIMELINE*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"└─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (!string.IsNullOrWhiteSpace(ticket.Observation))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *OBSERVAÇÃO DO SOLICITANTE*");
                sb.AppendLine(ticket.Observation);
            }

            return sb.ToString();
        }

        public static string BuildTestResolveMessage(TestTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("🎯 *TICKET FINALIZADO - TESTE*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO ATENDIMENTO*");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "N/A"}");
            sb.AppendLine($"├─ Tipo: {FormatTestType(ticket.TestType)}");
            sb.AppendLine($"├─ Linha: {ticket.LineName} ({FormatLineCategory(ticket.LineCategory)})");

            if (!string.IsNullOrEmpty(ticket.Product))
                sb.AppendLine($"├─ Produto: {ticket.Product}");

            sb.AppendLine($"├─ Linha Estava Parada: {(ticket.IsLineStopped ? "Sim" : "Não")}");

            if (ticket.IsLineStopped && !string.IsNullOrEmpty(ticket.LineStoppedTime))
                sb.AppendLine($"├─ Tempo de Parada: {ticket.LineStoppedTime}");

            sb.AppendLine();
            sb.AppendLine("⏱️ *TEMPO DE ATENDIMENTO*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"├─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");
            sb.AppendLine($"└─ Finalizado em: {(ticket.FinishedAt.HasValue ? ToBrasiliaTime(ticket.FinishedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (ticket.StartedAt.HasValue && ticket.FinishedAt.HasValue)
            {
                var duration = ticket.FinishedAt.Value - ticket.StartedAt.Value;
                sb.AppendLine();
                sb.AppendLine($"⏲️ Duração do Atendimento: {FormatDuration(duration)}");
            }

            if (!string.IsNullOrWhiteSpace(ticket.Observation))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *OBSERVAÇÃO DO SOLICITANTE*");
                sb.AppendLine(ticket.Observation);
            }

            return sb.ToString();
        }

        public static string BuildSoftwareMessage(SoftwareTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("💻 *TICKET DE SOFTWARE*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Requester: {ticket.RequesterName ?? "Requester não encontrado"}");
            sb.AppendLine($"├─ Setor: {ticket.Sector}");
            sb.AppendLine($"├─ Problema: {ticket.Problem}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine($"├─ Token Único: {ticket.ConfirmationToken}");
            sb.AppendLine();

            if (ticket.ProductionLine != null)
            {
                sb.AppendLine("📍 *LOCALIZAÇÃO (Produção)*");
                sb.AppendLine($"├─ Categoria: {ticket.ProductionLine.Prefix}");
                sb.AppendLine($"└─ Linha: {ticket.ProductionLine.LineName}");
            }
            else
            {
                sb.AppendLine("📍 *LOCALIZAÇÃO (Adm/Técnica)*");
                sb.AppendLine($"└─ Local: {ticket.PostLocation ?? "N/A"}");
            }

            AppendObservationAndDate(sb, ticket.NecessaryInfo, ticket.CreatedAt);

            return sb.ToString();
        }

        public static string BuildSoftwareStartMessage(SoftwareTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("✅ *TICKET ASSUMIDO - SOFTWARE*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("📋 *RESUMO DO TICKET*");
            sb.AppendLine($"├─ Setor: {ticket.Sector}");
            sb.AppendLine($"├─ Problema: {ticket.Problem}");

            if (ticket.ProductionLine != null)
                sb.AppendLine($"├─ Local: {ticket.ProductionLine.LineName}");
            else
                sb.AppendLine($"├─ Local: {ticket.PostLocation}");

            sb.AppendLine();
            sb.AppendLine("⏰ *TIMELINE*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"└─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (!string.IsNullOrWhiteSpace(ticket.NecessaryInfo))
            {
                sb.AppendLine();
                sb.AppendLine("📝 *DETALHES DO PROBLEMA*");
                sb.AppendLine(ticket.NecessaryInfo);
            }

            return sb.ToString();
        }

        public static string BuildSoftwareResolveMessage(SoftwareTickets ticket)
        {
            var sb = new StringBuilder();
            sb.AppendLine("🎯 *TICKET FINALIZADO - SOFTWARE*");
            sb.AppendLine($"├─ ID: {ticket.Id}");
            sb.AppendLine($"├─ Responsável: {ticket.ResolverName ?? "N/A"}");
            sb.AppendLine($"├─ Status: {FormatStatus(ticket.Status)}");
            sb.AppendLine();

            sb.AppendLine("⏱️ *TEMPO DE ATENDIMENTO*");
            sb.AppendLine($"├─ Aberto em: {ToBrasiliaTime(ticket.CreatedAt):dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"├─ Assumido em: {(ticket.StartedAt.HasValue ? ToBrasiliaTime(ticket.StartedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");
            sb.AppendLine($"└─ Finalizado em: {(ticket.FinishedAt.HasValue ? ToBrasiliaTime(ticket.FinishedAt.Value).ToString("dd/MM/yyyy HH:mm:ss") : "N/A")}");

            if (ticket.StartedAt.HasValue && ticket.FinishedAt.HasValue)
            {
                var duration = ticket.FinishedAt.Value - ticket.StartedAt.Value;
                sb.AppendLine();
                sb.AppendLine($"⏲️ Duração: {FormatDuration(duration)}");
            }

            return sb.ToString();
        }

        private static void AppendCommonLineInfo(StringBuilder sb, string category, string lineName, string? product)
        {
            sb.AppendLine("📍 *INFORMAÇÕES DA LINHA*");
            sb.AppendLine($"├─ Categoria: {FormatLineCategory(category)}");
            sb.AppendLine($"├─ Nome da Linha: {lineName}");
            if (!string.IsNullOrEmpty(product))
                sb.AppendLine($"├─ Produto: {product}");
        }

        private static void AppendObservationAndDate(StringBuilder sb, string? observation, DateTimeOffset createdAt)
        {
            sb.AppendLine();
            sb.AppendLine("📝 *OBSERVAÇÃO*");
            sb.AppendLine(string.IsNullOrWhiteSpace(observation) ? "O requester não adicionou informações adicionais" : observation);
            sb.AppendLine();
            sb.AppendLine($"📅 Gerado em: {ToBrasiliaTime(createdAt):dd/MM/yyyy HH:mm:ss}");
        }

        private static DateTime ToBrasiliaTime(DateTimeOffset utcDate)
        {
            var brasiliaZone = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            return TimeZoneInfo.ConvertTime(utcDate, brasiliaZone).DateTime;
        }

        private static DateTime ToBrasiliaTime(DateTime utcDate)
        {
            var brasiliaZone = TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(utcDate, brasiliaZone);
        }

        private static string FormatDuration(TimeSpan duration)
        {
            if (duration.TotalMinutes < 1)
                return $"{(int)duration.TotalSeconds} segundos";

            if (duration.TotalHours < 1)
                return $"{(int)duration.TotalMinutes} minutos";

            var hours = (int)duration.TotalHours;
            var minutes = duration.Minutes;
            return $"{hours}h {minutes}min";
        }

        private static string FormatStatus(TicketStatus status) => status switch
        {
            TicketStatus.Open => "Aberto",
            TicketStatus.InProgress => "Em Andamento",
            TicketStatus.Resolved => "Resolvido",
            _ => status.ToString()
        };

        private static string FormatLineCategory(string category) => category switch
        {
            "ML" => "Linha ML",
            "SA" => "Laboratório SA Product",
            "LAB" => "Laboratório SA Product",
            "SOLICITANTEING" => "Linha Monitoring",
            "INDUSTRIALSYSTEM" => "Linha Industrial System",
            "ESTEIRA" => "Esteira de Teste",
            "MANUAL" => "Posição Manual",
            "LOGS" => "Linhas LOGS",
            "MB" => "Linhas MB",
            "PC" => "Linhas PC",
            "PD" => "Linhas PD",
            _ => category
        };

        private static string FormatAutomationType(AutomationTicketType type) => type switch
        {
            AutomationTicketType.SystemSupport => "Sistemas da Linha",
            AutomationTicketType.LineTools => "Postos da Linha",
            AutomationTicketType.LineSystems => "Sistemas da Linha",
            _ => type.ToString()
        };

        private static string FormatLineSystem(LineSystem? system) => system switch
        {
            LineSystem.Monitoring => "Monitoring",
            LineSystem.ModularSystem => "Modular System",
            LineSystem.IndustrialSystem => "Industrial System",
            _ => system?.ToString() ?? string.Empty
        };

        private static string FormatSystemSupport(SystemSupportType? type) => type switch
        {
            SystemSupportType.ProductRegistration => "Cadastro de Produto",
            SystemSupportType.WeightNotIncreasing => "Peso não sobe na Balança",
            SystemSupportType.ScaleWeightIssue => "Problema na Balança de Peso",
            SystemSupportType.SoftwareInstallation => "Instalação de Software",
            _ => type?.ToString() ?? string.Empty
        };

        private static string FormatToolType(LineToolType? type) => type switch
        {
            LineToolType.LabelValidation => "Label Validation",
            LineToolType.ProductTesting => "Ensaio de Bancada Product",
            _ => type?.ToString() ?? string.Empty
        };

        private static string FormatLabelValidation(LabelValidationType? type) => type switch
        {
            LabelValidationType.CameraPointing => "Configurar Câmera do Apontamento",
            LabelValidationType.CameraDoubleCheck => "Configurar Câmera do Double Check",
            LabelValidationType.FullConfiguration => "Configuração Total",
            _ => type?.ToString() ?? string.Empty
        };

        private static string FormatSetupType(SetupTicketType type) => type switch
        {
            SetupTicketType.LineSetup => "Setup de Linha",
            SetupTicketType.MaterialRequest => "Solicitação de Material",
            _ => type.ToString()
        };

        private static string FormatTestType(TestTicketType type) => type switch
        {
            TestTicketType.FinalTest => "Final Test",
            TestTicketType.LogFiles => "Arquivos de Log",
            _ => type.ToString()
        };
    }
}