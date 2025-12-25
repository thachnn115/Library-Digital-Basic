package be.library_digital.demo.service;

import be.library_digital.demo.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService{

    UserDetailsService userDetailsService();

    User getByUsername(String userName);
}
