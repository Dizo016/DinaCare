package br.com.dinacare.domain.client;

public class ClientMapper {

    public static Client toEntity(ClientRequest request) {
        return Client.builder()
                .name(request.name())
                .phone(request.phone())
                .notes(request.notes())
                .build();
    }

    public static ClientResponse toResponse(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getPhone(),
                client.getNotes(),
                client.getActive()
        );
    }
}