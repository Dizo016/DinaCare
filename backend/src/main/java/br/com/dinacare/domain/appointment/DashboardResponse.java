package br.com.dinacare.domain.appointment;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        long agendamentosHoje,
        BigDecimal receitaMes,
        long totalClientes,
        double taxaConclusao,
        List<MonthlyRevenue> ultimos6Meses,
        String procedimentoMaisVendido,
        String clienteMaisFiel,
        String melhorDia,
        List<AppointmentResponse> proximosHoje
) {
    public record MonthlyRevenue(String mes, int ano, BigDecimal total) {}
}