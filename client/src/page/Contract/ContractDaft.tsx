import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressBarHeader from './components/ProgressBarHeader/ProgressBarHeader';
import Stage1Draft from './components/stages/StageDraft';
import Stage2Milestones from './components/stages/Milestones/StageMilestones';
// import Stage4Preview from "./components/stages/PreviewContract/StagePreview";
import { useContractStore } from '~/store/contract-store';
// import { useContractForm } from "~/hooks/useContractForm";
import styles from './ContractDaft.module.scss';
import classNames from 'classnames/bind';
import { routePrivate } from '~/config/routes.config';
import StageNotifications from './components/stages/Notification/StageNotifications';

const cx = classNames.bind(styles);

const ContractDraft = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentStep, goToStep } = useContractStore();
    // const { formData, validateStep } = useContractForm();

    // Get mode and draftId from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') || 'basic';
    const draftId = searchParams.get('draftId');

    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const lastScrollYRef = useRef(0);
    const tickingRef = useRef(false);
    const isVisibleRef = useRef(true);
    const isAtTopRef = useRef(true);

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollThreshold = 100;
        const atTop = currentScrollY <= scrollThreshold;

        if (atTop !== isAtTopRef.current) {
            setIsAtTop(atTop);
            isAtTopRef.current = atTop;
        }

        if (atTop) {
            if (!isVisibleRef.current) {
                setIsVisible(true);
                isVisibleRef.current = true;
            }
        } else {
            const scrollingUp = currentScrollY < lastScrollYRef.current;
            const scrollingDown = currentScrollY > lastScrollYRef.current;

            if (Math.abs(currentScrollY - lastScrollYRef.current) > 10) {
                if (scrollingUp && !isVisibleRef.current) {
                    setIsVisible(true);
                    isVisibleRef.current = true;
                } else if (scrollingDown && isVisibleRef.current) {
                    setIsVisible(false);
                    isVisibleRef.current = false;
                }
            }
        }

        lastScrollYRef.current = currentScrollY;
    };

    useEffect(() => {
        const onScroll = () => {
            if (!tickingRef.current) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    tickingRef.current = false;
                });
                tickingRef.current = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        if (currentStep < 1 || currentStep > 4) {
            goToStep(1);
            navigate(`/${routePrivate.createContract}`);
        }
    }, [currentStep, goToStep, navigate]);

    // useEffect(() => {
    //     if (currentStep > 1) {
    //         for (let i = 1; i < currentStep; i++) {
    //             if (!validateStep(i)) {
    //                 goToStep(i);
    //                 navigate(`/${routePrivate.createContract}`);
    //                 return;
    //             }
    //         }
    //     }
    // }, [currentStep, validateStep, goToStep, navigate]);

    const renderStage = () => {
        switch (currentStep) {
            case 1:
                return <Stage1Draft contractType={mode} draftId={draftId} />;
            case 2:
                return <Stage2Milestones />;
            case 3:
                return <Stage1Draft contractType={mode} draftId={draftId} />;
            case 4:
                return <StageNotifications />;
            // return <Stage4Preview />;
            default:
                return <Stage1Draft contractType={mode} draftId={draftId} />;
        }
    };

    return (
        <div className={cx('wrapper', { collapse: isVisible })}>
            {formData.mode === 'editor' && (
                <ProgressBarHeader currentStage={currentStep} isVisible={isVisible} isAtTop={isAtTop} />
            )}
            <div className={cx('container')}>{renderStage()}</div>
        </div>
    );
};

export default ContractDraft;
