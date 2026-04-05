package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.enity.Enums.Role;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        userRepository.findByGoogleId(googleId).orElseGet(() ->
            userRepository.findByEmail(email).map(existing -> {
                existing.setGoogleId(googleId);
                if (existing.getAvatarUrl() == null) existing.setAvatarUrl(picture);
                return userRepository.save(existing);
            }).orElseGet(() -> userRepository.save(
                User.builder()
                    .email(email)
                    .fullName(name)
                    .avatarUrl(picture)
                    .googleId(googleId)
                    .role(Role.CUSTOMER)
                    .emailVerified(true)
                    .isActive(true)
                    .build()
            ))
        );

        return oAuth2User;
    }
}
