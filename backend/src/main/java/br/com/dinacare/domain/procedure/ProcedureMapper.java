package br.com.dinacare.domain.procedure;
public class ProcedureMapper {

    public static Procedure toEntity(ProcedureRequest request) {
        return Procedure.builder()
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
