package br.com.dinacare.domain.user;

public class UserMapper {

    public static User toEntity(UserRequest request, String encodedPassword) {
        return User.builder()
                .name(request.name())
                .login(request.login())
                .password(encodedPassword)
                .userRole(request.userRole())
                .entryTime(request.entryTime())
                .exitTime(request.exitTime())
                .lunchStartTime(request.lunchStartTime())
                .lunchEndTime(request.lunchEndTime())
                .workDays(request.workDays())
                .especialidade(request.especialidade())
                .bio(request.bio())
                .endereco(request.endereco())
                .build();
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getLogin(),
                user.getUserRole(),
                user.getEntryTime(),
                user.getExitTime(),
                user.getLunchStartTime(),
                user.getLunchEndTime(),
                user.getWorkDays(),
                user.getEspecialidade(),
                user.getBio(),
                user.getEndereco(),
                user.getActive()
        );
    }
}