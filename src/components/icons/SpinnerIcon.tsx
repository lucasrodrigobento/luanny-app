import React from 'react';

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    const defaultProps = {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "white",
        ...props
    };

    return (
        <svg {...defaultProps}>
            <style>{`.spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}.spinner_zKoa{animation-delay:-.1s}.spinner_YpZS{transform-origin:center;animation:spinner_zKoa 2s linear infinite}.spinner_YpZS{animation-delay:-.2s}.spinner_q27e{transform-origin:center;animation:spinner_zKoa 2s linear infinite}@keyframes spinner_zKoa{100%{transform:rotate(360deg)}}`}</style>
            <path className="spinner_V8m1" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path className="spinner_YpZS" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"/>
        </svg>
    );
};
