package com.succulentshop.backend.dto;

import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class PageResponse<T> {

    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean empty;

    public PageResponse() {
        this.content = Collections.emptyList();
    }

    public PageResponse(List<T> content, int pageNumber, int pageSize, long totalElements) {
        this.content = content != null ? content : Collections.emptyList();
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 0;
        this.first = pageNumber <= 0;
        this.last = pageNumber >= this.totalPages - 1;
        this.empty = this.content.isEmpty();
    }

    public static <T> PageResponse<T> of(List<T> content, int pageNumber, int pageSize, long totalElements) {
        return new PageResponse<>(content, pageNumber, pageSize, totalElements);
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        if (page == null) {
            return empty();
        }
        PageResponse<T> response = new PageResponse<>();
        response.setContent(page.getContent());
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setEmpty(page.isEmpty());
        return response;
    }

    public static <S, T> PageResponse<T> from(Page<S> page, Function<S, T> mapper) {
        if (page == null) {
            return empty();
        }
        List<T> mappedContent = page.getContent().stream()
                .map(mapper)
                .collect(Collectors.toList());

        PageResponse<T> response = new PageResponse<>();
        response.setContent(mappedContent);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setEmpty(page.isEmpty());
        return response;
    }

    public static <T> PageResponse<T> empty() {
        PageResponse<T> response = new PageResponse<>();
        response.setContent(Collections.emptyList());
        response.setPageNumber(0);
        response.setPageSize(0);
        response.setTotalElements(0);
        response.setTotalPages(0);
        response.setFirst(true);
        response.setLast(true);
        response.setEmpty(true);
        return response;
    }

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
        this.empty = content == null || content.isEmpty();
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public boolean isEmpty() {
        return empty;
    }

    public void setEmpty(boolean empty) {
        this.empty = empty;
    }
}
