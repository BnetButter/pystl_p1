import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
      <h1>PySTL </h1>

      

      <footer style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p>&copy; {new Date().getFullYear()} PySTL. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
  