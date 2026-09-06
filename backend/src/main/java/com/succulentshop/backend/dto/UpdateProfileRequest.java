package com.succulentshop.backend.dto;

public class UpdateProfileRequest {
    private String email;
    private String name;
    private String phone;
    private String address;
    private String avatar;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String email, String name, String phone, String address, String avatar) {
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.avatar = avatar;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
