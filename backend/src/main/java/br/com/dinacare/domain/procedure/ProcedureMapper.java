package br.com.dinacare.domain.procedure;

import br.com.dinacare.domain.user.User;

public class ProcedureMapper {

    public static Procedure toEntity(ProcedureRequest request, User user) {
        return Procedure.builder()
                .user(user)
                .name(request.name())
                .duration(request.duration())
                .price(request.price())
                .build();
    }

    public static ProcedureResponse toResponse(Procedure procedure) {
        return new ProcedureResponse(
                procedure.getId(),
                procedure.getName(),
                procedure.getDuration(),
                procedure.getPrice(),
                procedure.getActive()
        );
    }
}