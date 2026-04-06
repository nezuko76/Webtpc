package com.thucphamsach.backend_ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendEcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendEcommerceApplication.class, args);
	}

}
