import classNames from 'classnames/bind';
import style from './Section.module.scss';
import { ChevronDown, ChevronUp, GripVertical, Plus } from 'lucide-react';
import Button from '~/components/Button';

const cx = classNames.bind(style);

interface SectionProps {
    sections: {
        id: string;
        title: string;
        description: string;
        icon: React.ElementType;
        template: string;
    }[];
}

const Section = ({ sections }: SectionProps) => {
    return (
        <div className={cx('sb-ct-gr')}>
            <div>
                <h3 className={cx('sb-ct-label')}>Mục chưa sử dụng</h3>
                <p className={cx('sb-ct-label-sm')}>Kéo và thả mục bất kỳ vào vị trí bạn muốn thêm trên hợp đồng</p>
                <div className={cx('sb-card-gr')}>
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            // draggable
                            // onDragStart={(e) => {
                            //     setDraggedItem({
                            //         type: 'template',
                            //         id: section.id,
                            //         sourceIndex: -1,
                            //         data: section,
                            //     });
                            // }}
                            // onClick={() => addPredefinedSection(section)}
                            className={cx('sb-card-contain')}
                        >
                            <div className={cx('sb-card')}>
                                <section.icon className={cx('sb-card-ic')} />
                                <div className={cx('sb-card-sc')}>
                                    <div className={cx('sb-card-sc-title')}>{section.title}</div>
                                    <div className={cx('sb-card-sc-des')}>{section.description}</div>
                                </div>
                                <Plus className={cx('sb-card-sc-des-ic')} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className={cx('sb-ct-label')}>Mục đã sử dụng</h3>
                <p className={cx('sb-ct-label-sm')}>Click để xem vị trí của mục trên CV</p>
                <div>
                    <div className={cx('sb-card-used')}>
                        <div className={cx('sb-card')}>
                            <div className={cx('sb-card-fs')}>
                                <GripVertical className={cx('sb-card-ic')} />
                                <div style={{ marginRight: '12px' }}>
                                    <>
                                        <div className={cx('sb-card-sc-title')}>Ngày tháng nơi ký</div>
                                        <div className={cx('sb-card-sc-des-vt')}>Vị trí 1</div>
                                    </>
                                </div>
                            </div>
                            <div className={cx('btn-action')}>
                                <button className={cx('btn-ac')}>
                                    <ChevronUp size={16} className={cx('icon')} />
                                </button>
                                <button className={cx('btn-ac')}>
                                    <ChevronDown size={16} className={cx('icon')} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Section;
