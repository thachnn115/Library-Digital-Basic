package be.library_digital.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;

@Getter
public class SignInRequest implements Serializable {

    @NotBlank(message = "email must be not blank")
    private String email;

    @NotBlank(message = "password must be not blank")
    private String password;
}
