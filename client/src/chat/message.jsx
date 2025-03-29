import React from 'react';

const Message = ({ username, content }) => {
    return (
        <div>
            <strong>{username}: </strong>
            <span>{content}</span>
        </div>
    );
};

export default Message;
