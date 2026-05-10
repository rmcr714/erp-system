package com.antigravity.erp.config;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class PerformanceHeaderAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        
        Long count = QueryCountHolder.getCount();
        Long time = QueryCountHolder.getTimeElapsed();

        if (count != null) {
            response.getHeaders().add("X-SQL-Query-Count", String.valueOf(count));
            response.getHeaders().add("X-SQL-Execution-Time-MS", String.valueOf(time));
            System.out.println("ADVICE: Attached headers for " + request.getURI().getPath() + ". Queries: " + count);
        } else {
            System.out.println("ADVICE: No SQL count found for " + request.getURI().getPath());
        }
        
        return body;
    }
}
