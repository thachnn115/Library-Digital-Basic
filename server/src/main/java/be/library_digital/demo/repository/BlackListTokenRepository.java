package be.library_digital.demo.repository;

import be.library_digital.demo.model.BlackListToken;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Repository
public interface BlackListTokenRepository extends CrudRepository<BlackListToken, String> {


    @Transactional(rollbackFor = Exception.class)
    @Modifying
    @Query("DELETE FROM BlackListToken b WHERE b.expiredAt < :now")
    int deleteExpiredTokens(Date now);
}
