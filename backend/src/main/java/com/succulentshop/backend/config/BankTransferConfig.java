package com.succulentshop.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BankTransferConfig {

    @Value("${sepay.api-key:}")
    private String sepayApiKey;

    @Value("${bank.code:VCB}")
    private String bankCode;

    @Value("${bank.account-number:1028889999}")
    private String accountNumber;

    @Value("${bank.account-name:SEN XINH GARDEN}")
    private String accountName;

    public String getSepayApiKey() {
        return sepayApiKey;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }
}
