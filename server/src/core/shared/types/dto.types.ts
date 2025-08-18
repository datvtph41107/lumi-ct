/**
 * Common DTO types and base classes
 */

import { IsOptional, IsNumber, IsString, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Base DTO classes
export abstract class BasePaginationDto {
    @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search term' })
    @IsOptional()
    @IsString()
    search?: string;
}

export abstract class BaseDateRangeDto {
    @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
    @IsOptional()
    @IsString()
    date_from?: string;

    @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
    @IsOptional()
    @IsString()
    date_to?: string;
}

export abstract class BaseFilterDto extends BasePaginationDto {
    @ApiPropertyOptional({ description: 'Sort by field' })
    @IsOptional()
    @IsString()
    sort_by?: string;

    @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sort_order?: 'ASC' | 'DESC' = 'DESC';
}

// Transform decorators for common use cases
export const TransformToNumber = () => Transform(({ value }) => {
    if (typeof value === 'string') {
        const num = parseInt(value, 10);
        return isNaN(num) ? value : num;
    }
    return value;
});

export const TransformToBoolean = () => Transform(({ value }) => {
    if (typeof value === 'string') {
        return value === 'true' || value === '1';
    }
    return Boolean(value);
});

export const TransformToArray = () => Transform(({ value }) => {
    if (typeof value === 'string') {
        return value.split(',').map(item => item.trim());
    }
    return Array.isArray(value) ? value : [value];
});

// Validation decorators
export const IsOptionalNumber = () => [IsOptional(), Type(() => Number), IsNumber()];
export const IsOptionalString = () => [IsOptional(), IsString()];
export const IsOptionalBoolean = () => [IsOptional(), IsBoolean()];

// Response DTOs
export class BaseResponseDto<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    
    constructor(data?: T, message = 'Success') {
        this.success = true;
        this.message = message;
        this.data = data;
    }
}

export class PaginatedResponseDto<T = unknown> extends BaseResponseDto<{
    items: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}> {
    constructor(
        items: T[], 
        totalItems: number, 
        currentPage: number, 
        itemsPerPage: number,
        message = 'Success'
    ) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        super({
            items,
            meta: {
                totalItems,
                itemCount: items.length,
                itemsPerPage,
                totalPages,
                currentPage,
            },
        }, message);
    }
}