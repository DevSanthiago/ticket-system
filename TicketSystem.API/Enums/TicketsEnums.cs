namespace TicketSystem.API.Enums
{
    public enum SoftwareSector
    {
        AtSac,
        SacSp,
        Rca,
        Aplicacoes,
        Qualidade,
        AtProducao,
        Producao,
        ProducaoQualidade
    }

    public enum SoftwareProblem
    {
        SemCadastroDeBios,
        DivergenciaHardware,
        VincularDesvincularChaves,
        ErroEmTeste,
        ImagemNaoDisponivel,
        ProblemasDiversos,
        Bugs,
        Duvidas,
        SolicitacaoNovaFeature,
        Relatorios,
        ErroDeRede,
        ErroAoEnviarLog,
        ErroNoDownload,
        ErroNoGravadorDpk,
        ErroNaBalanca,
        LentidaoAtualizacao,
        LentidaoDownload,
        ReparoSistema,
        AberturaOS,
        Cadastros,
        Outros
    }

    public enum SetupTicketType
    {
        LineSetup,
        MaterialRequest
    }

    public enum AutomationTicketType
    {
        LineSystems,
        LineTools,
        SystemSupport
    }

    public enum LineSystem
    {
        Monitoring,
        ModularSystem,
        IndustrialSystem
    }

    public enum SystemSupportType
    {
        ProductRegistration,
        ScaleWeightIssue,
        SoftwareInstallation,
        WeightNotIncreasing
    }

    public enum LineToolType
    {
        LabelValidation,
        ProductTesting
    }

    public enum LabelValidationType
    {
        CameraPointing,
        CameraDoubleCheck,
        FullConfiguration
    }

    public enum TestTicketType
    {
        FinalTest,
        LogFiles
    }

    public enum TicketStatus
    {
        Open = 1,
        InProgress = 2,
        Resolved = 3
    }

    public enum ChecklistStatus
    {
        NotRequired,
        Pending,
        Completed
    }
}