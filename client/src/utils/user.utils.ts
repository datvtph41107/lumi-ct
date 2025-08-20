export const getDepartmentLabel = (dept: string): string => {
    return dept === 'admin' ? 'Phòng Hành chính' : 'Phòng Kế toán';
};

export const getRoleLabel = (role: string): string => {
    return role === 'manager' ? 'Quản lý' : 'Nhân viên';
};

export const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    const firstLetter = words[0].charAt(0);
    const lastLetter = words[words.length - 1].charAt(0);
    return (firstLetter + lastLetter).toUpperCase();
};

export const getAvatarColor = (name: string): string => {
    const colors = [
        '#E3F2FD',
        '#F3E5F5',
        '#E8F5E8',
        '#FFF3E0',
        '#FCE4EC',
        '#E1F5FE',
        '#F1F8E9',
        '#FFF8E1',
        '#FFEBEE',
        '#E8EAF6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export const getAvatarTextColor = (name: string): string => {
    const textColors = [
        '#1976D2',
        '#7B1FA2',
        '#388E3C',
        '#F57C00',
        '#C2185B',
        '#0288D1',
        '#689F38',
        '#FBC02D',
        '#D32F2F',
        '#512DA8',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % textColors.length;
    return textColors[index];
};
