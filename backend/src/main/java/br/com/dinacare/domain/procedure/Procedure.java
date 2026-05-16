package br.com.dinacare.domain.procedure;

import br.com.dinacare.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "procedures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Procedure {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private BigDecimal price;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}