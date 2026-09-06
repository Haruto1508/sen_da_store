package com.succulentshop.backend.repository;

import com.succulentshop.backend.entity.SocialAccount;
import com.succulentshop.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    Optional<SocialAccount> findByProviderAndProviderId(String provider, String providerId);

    List<SocialAccount> findByUser(User user);

    Optional<SocialAccount> findByEmail(String email);
}
