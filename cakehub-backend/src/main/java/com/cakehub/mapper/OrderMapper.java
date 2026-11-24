package com.cakehub.mapper;

import com.cakehub.dto.order.OrderItemResponse;
import com.cakehub.dto.order.OrderResponse;
import com.cakehub.entity.Address;
import com.cakehub.entity.Order;
import com.cakehub.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "variantId", source = "variant.id")
    OrderItemResponse toItemResponse(OrderItem item);

    OrderResponse.DeliveryAddressDto toDeliveryAddressDto(Address address);

    OrderResponse toResponse(Order order);
}