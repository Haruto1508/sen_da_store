package com.succulentshop.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BankTransferConfig {

    @Value("${sepay.api-key:}")
    private String sepayApiKey;

    @Value("${bank.code:MB}")
    private String bankCode;

    @Value("${bank.account-number:0001761675223}")
    private String accountNumber;

    @Value("${bank.account-name:NGUYEN HOANG THAI VINH}")
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
