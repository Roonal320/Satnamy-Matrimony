import React, { useState, useEffect } from 'react';

export const SafeEmail = ({ className, style, linkClassName, linkStyle, textOnly = false }) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Construct email only on client side after component mounts
    const user = 'satnamishaadiii';
    const domain = 'gmail.com';
    setEmail(`${user}@${domain}`);
  }, []);

  if (!email) {
    return <span className={className} style={style}>...</span>;
  }

  return (
    <span data-nosnippet="" className={className} style={style}>
      {textOnly ? (
        email
      ) : (
        <a href={`mailto:${email}`} className={linkClassName} style={linkStyle}>
          {email}
        </a>
      )}
    </span>
  );
};
