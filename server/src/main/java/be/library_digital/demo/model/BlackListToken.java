package be.library_digital.demo.model;

import be.library_digital.demo.common.TokenType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "blacklist_tokens")
public class BlackListToken {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "token", nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false)
    private TokenType type;

    @Column(nullable = false, name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "expired_at", nullable = false)
    private Date expiredAt;

    @Column(name = "reason")
    private String reason;
}
