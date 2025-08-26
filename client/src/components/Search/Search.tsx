import React from 'react';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import { Search } from 'lucide-react';

const cx = classNames.bind(styles);

interface SearchInputProps {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value = '', placeholder = 'Tìm kiếm...', onChange, className }) => {
    return (
        <div className={cx('searchWrapper', className)}>
            <Search className={cx('icon')} size={16} />
            <input
                type="text"
                className={cx('searchInput')}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchInput;
