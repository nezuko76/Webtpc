package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.enity.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("verifyUrl", frontendUrl + "/verify-email?token=" + token);
            String html = templateEngine.process("email/verification", context);
            sendHtmlEmail(toEmail, "Xác nhận email - Thực Phẩm Sạch", html);
            log.info("Đã gửi email xác nhận tới {}", toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email xác nhận tới {}: {}", toEmail, e.getMessage());
            // KHÔNG throw — đăng ký vẫn thành công dù email lỗi
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("otp", otp);
            String html = templateEngine.process("email/otp", context);
            sendHtmlEmail(toEmail, "Mã OTP đặt lại mật khẩu - Thực Phẩm Sạch", html);
            log.info("Đã gửi OTP tới {}", toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi OTP tới {}: {}", toEmail, e.getMessage());
            // KHÔNG throw — không ảnh hưởng flow
        }
    }

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String fullName, Order order) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("order", order);
            context.setVariable("frontendUrl", frontendUrl);
            String html = templateEngine.process("email/order-confirmation", context);
            sendHtmlEmail(toEmail, "Xác nhận đơn hàng #" + order.getId(), html);
            log.info("Đã gửi email xác nhận đơn hàng #{} tới {}", order.getId(), toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email đơn hàng #{}: {}", order.getId(), e.getMessage());
            // KHÔNG throw — đơn hàng vẫn được tạo
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(mailFrom);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
