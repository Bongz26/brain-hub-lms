import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>Test Component - If you see this, React is working!</h1>
      <p>This is a test to see if components render correctly.</p>
    </div>
  );
};

export default TestComponent;