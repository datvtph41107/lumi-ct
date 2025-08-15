import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faCheckCircle, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './SmartSuggestions.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface SmartSuggestionsProps {
    suggestions: string[];
    onApply: (suggestion: string) => void;
    onDismiss?: (suggestion: string) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ suggestions, onApply, onDismiss }) => {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className={cx('smart-suggestions')}>
            <div className={cx('suggestions-header')}>
                <FontAwesomeIcon icon={faLightbulb} />
                <span>Gợi ý thông minh</span>
            </div>

            <div className={cx('suggestions-list')}>
                {suggestions.map((suggestion, index) => (
                    <div key={index} className={cx('suggestion-item')}>
                        <div className={cx('suggestion-content')}>
                            <span className={cx('suggestion-text')}>{suggestion}</span>
                        </div>

                        <div className={cx('suggestion-actions')}>
                            <button
                                className={cx('apply-btn')}
                                onClick={() => onApply(suggestion)}
                                title="Áp dụng gợi ý"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Áp dụng
                            </button>

                            {onDismiss && (
                                <button
                                    className={cx('dismiss-btn')}
                                    onClick={() => onDismiss(suggestion)}
                                    title="Bỏ qua gợi ý"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('suggestions-footer')}>
                <span className={cx('suggestions-info')}>Gợi ý dựa trên nội dung hợp đồng và quy định pháp luật</span>
            </div>
        </div>
    );
};

export default SmartSuggestions;
