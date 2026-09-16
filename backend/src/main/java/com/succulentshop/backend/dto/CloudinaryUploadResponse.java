package com.succulentshop.backend.dto;

public class CloudinaryUploadResponse {
    private String url;
    private String publicId;
    private String storage;
    private Long bytes;
    private String format;
    private String note;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }

    public Long getBytes() { return bytes; }
    public void setBytes(Long bytes) { this.bytes = bytes; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
