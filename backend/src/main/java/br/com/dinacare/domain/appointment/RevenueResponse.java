package br.com.dinacare.domain.appointment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueResponse(
        BigDecimal total,
        Integer count,
        BigDecimal ticketMedio,
        List<DailyRevenue> porDia
) {
    public record DailyRevenue(LocalDate date, BigDecimal total, Integer count) {}
}