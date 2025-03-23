import React from 'react';
import styled from 'styled-components';
import museService from '../../services/MuseService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h2`
  margin: 0;
`;

const ComingSoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  padding: 3rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-height: 400px;
  
  h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    color: #2563eb;
  }

  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
    max-width: 500px;
  }
`;

const BrainIllustration = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const FeatureList = styled.ul`
  text-align: left;
  margin-top: 1rem;
  
  li {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    
    &:before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 8px;
      background-color: #2563eb;
      border-radius: 50%;
    }
  }
`;

const BrainMap = () => {
  // Check connection status
  const [connected, setConnected] = React.useState(false);
  
  React.useEffect(() => {
    const subscription = museService.connectionStatus.subscribe(status => {
      setConnected(status);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <Container>
      <Header>
        <PageTitle>Brain Map</PageTitle>
      </Header>
      
      <ComingSoonContainer>
        <BrainIllustration>
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M306.9 126.8C326.5 115.4 349.7 113.8 370.5 122.4C391.3 131 406.9 148.9 411.9 170.7C416.9 192.5 410.6 215.5 395.2 232.2C379.8 248.9 357.4 257.8 334.8 256.3" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M334.1 255.8C346.4 273.4 348.9 296.7 340.8 317.1C332.7 337.5 315.2 352.5 293.8 356.9C272.4 361.3 249.9 354.5 233.7 338.8C217.5 323.1 209.2 300.8 211.2 278.2" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M211.8 278.8C193.5 268.2 180.9 250.1 177.3 229.4C173.7 208.6 179.4 187.2 192.9 171.2C206.4 155.2 226.5 146.2 247.7 146.6C269 147 289 156.9 302 173.4" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M302.3 172.9C310.5 161.5 322.5 153.4 336.2 149.9C349.9 146.5 364.4 147.8 377.1 153.7C389.8 159.5 399.9 169.5 405.6 182.1C411.3 194.7 412.4 209.1 408.7 222.7" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M408.5 223.3C417.1 235.6 421.1 250.9 419.7 266.2C418.3 281.5 411.6 295.7 400.6 306.3C389.6 316.8 375.2 322.9 359.9 323.4C344.5 323.9 329.7 318.6 318.1 308.8" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M318.4 309.4C311.6 320.9 301.2 329.8 288.7 334.8C276.3 339.7 262.5 340.5 249.7 337.1C236.8 333.6 225.7 326.2 218 316.1C210.2 306 206.2 293.7 206.5 281.1" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M206.1 281.6C196.3 270.9 190.2 257.2 189.1 242.6C187.9 228 191.7 213.5 199.9 201.5C208.1 189.6 220.3 180.8 234.4 176.5C248.4 172.2 263.5 172.7 277.2 177.9" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M294.1 190.1C294.1 190.1 278.1 177.9 278.1 177.9" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M251.5 237.4C263.5 237.4 273.2 227.7 273.2 215.7C273.2 203.7 263.5 194 251.5 194C239.5 194 229.8 203.7 229.8 215.7C229.8 227.7 239.5 237.4 251.5 237.4Z" fill="#DBEAFE"/>
            <path d="M251.5 237.4C263.5 237.4 273.2 227.7 273.2 215.7C273.2 203.7 263.5 194 251.5 194C239.5 194 229.8 203.7 229.8 215.7C229.8 227.7 239.5 237.4 251.5 237.4Z" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M351.8 216.7C351.8 228.7 342.1 238.4 330.1 238.4C318.1 238.4 308.4 228.7 308.4 216.7C308.4 204.7 318.1 195 330.1 195C342.1 195 351.8 204.7 351.8 216.7Z" fill="#DBEAFE"/>
            <path d="M351.8 216.7C351.8 228.7 342.1 238.4 330.1 238.4C318.1 238.4 308.4 228.7 308.4 216.7C308.4 204.7 318.1 195 330.1 195C342.1 195 351.8 204.7 351.8 216.7Z" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M160.5 221.2C155.1 227.9 148.1 233.2 140.2 236.6C132.3 240 123.6 241.4 115 240.7C106.3 240 97.9 237.3 90.6 232.7C83.3 228.1 77.2 221.8 73 214.4" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M72.9 213.5C65 207.6 59.2 199.5 56.2 190.2C53.2 180.9 53 170.9 55.8 161.5C58.5 152.1 64.1 143.8 71.8 137.7C79.6 131.6 89.1 128 99 127.3" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M178.9 222.5C175.4 232.2 169.3 240.6 161.2 246.9C153.2 253.2 143.5 257.1 133.3 258.3C123.1 259.5 112.7 257.9 103.3 253.7C94 249.5 86 242.8 80.3 234.3" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M80.2 234.5C76.6 226.9 75.5 218.5 76.8 210.2C78.1 202 81.8 194.3 87.5 188.1C93.1 181.8 100.5 177.3 108.6 175.1C116.8 172.9 125.5 173.1 133.5 175.8" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M178.6 229.7C177.8 240.8 173.1 251.3 165.3 259.2C157.5 267.1 147.1 271.9 135.9 272.7C124.8 273.5 113.8 270.1 105 263.2C96.3 256.3 90.4 246.3 88.5 235.3" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M88.5 235.4C85.5 226.5 85.6 216.9 88.8 208.1C92 199.2 98.1 191.6 106.2 186.5C114.2 181.5 123.7 179.3 133.2 180.3C142.7 181.3 151.6 185.4 158.5 192.1" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M161.3 155.4C165.7 164.8 166.9 175.5 164.7 185.7C162.5 195.9 157 205.1 149.1 211.8C141.3 218.5 131.5 222.3 121.2 222.8C110.9 223.2 100.8 220.3 92.5 214.5" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M92.3 214.5C84.7 207.8 79.6 198.9 77.8 189.1C76 179.3 77.6 169.1 82.4 160.3C87.1 151.4 94.6 144.4 103.8 140.3C113 136.3 123.3 135.4 133 137.6" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M141 145.7C141 145.7 133 137.7 133 137.7" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M128.9 383.3C132.9 374.1 140.5 367.1 150 363.9C159.4 360.7 169.9 361.7 178.5 366.7" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M178.5 366.7C189.3 372.5 197.1 382.7 199.9 394.7C202.7 406.7 200.3 419.4 193.3 429.3" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M193.3 429.3C185.7 440.2 173.3 447 159.7 447.7C146.1 448.4 132.9 442.9 124.1 432.8" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M124.1 432.9C114.9 422.3 111.3 407.9 114.1 394.2C116.9 380.5 125.8 369.2 138 363.6" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M167.8 384C171.8 374.8 179.3 367.8 188.8 364.5C198.3 361.3 208.7 362.3 217.4 367.3" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M217.4 367.3C228.2 373.1 236 383.3 238.8 395.3C241.7 407.3 239.2 420 232.2 429.9" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M232.2 429.9C224.6 440.8 212.2 447.6 198.6 448.3C185 449 171.8 443.5 163 433.4" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M163 433.5C153.8 423 150.2 408.5 153 394.8C155.8 381.1 164.7 369.8 176.9 364.2" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M139.5 201.3C139.5 213.3 129.8 223 117.8 223C105.8 223 96.1 213.3 96.1 201.3C96.1 189.3 105.8 179.6 117.8 179.6C129.8 179.6 139.5 189.3 139.5 201.3Z" fill="#DBEAFE"/>
            <path d="M139.5 201.3C139.5 213.3 129.8 223 117.8 223C105.8 223 96.1 213.3 96.1 201.3C96.1 189.3 105.8 179.6 117.8 179.6C129.8 179.6 139.5 189.3 139.5 201.3Z" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M186 403.1C186 415.1 176.3 424.8 164.3 424.8C152.3 424.8 142.7 415.1 142.7 403.1C142.7 391.1 152.3 381.4 164.3 381.4C176.3 381.4 186 391.1 186 403.1Z" fill="#DBEAFE"/>
            <path d="M186 403.1C186 415.1 176.3 424.8 164.3 424.8C152.3 424.8 142.7 415.1 142.7 403.1C142.7 391.1 152.3 381.4 164.3 381.4C176.3 381.4 186 391.1 186 403.1Z" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M217.5 403.1C217.5 415.1 207.8 424.8 195.8 424.8C183.8 424.8 174.1 415.1 174.1 403.1C174.1 391.1 183.8 381.4 195.8 381.4C207.8 381.4 217.5 391.1 217.5 403.1Z" fill="#DBEAFE"/>
            <path d="M217.5 403.1C217.5 415.1 207.8 424.8 195.8 424.8C183.8 424.8 174.1 415.1 174.1 403.1C174.1 391.1 183.8 381.4 195.8 381.4C207.8 381.4 217.5 391.1 217.5 403.1Z" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M320.3 340.3C319.9 350.9 316 361.1 309.1 369.4C302.3 377.7 292.9 383.5 282.4 386.1C271.8 388.8 260.7 388.2 250.5 384.3C240.3 380.5 231.6 373.7 225.8 364.8" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M225.8 364.8C218.4 354.1 215.1 341.1 216.5 328.1C217.9 315.2 223.9 303.2 233.5 294.5C243.1 285.8 255.6 280.9 268.6 280.9C281.6 280.9 294.1 285.8 303.6 294.4" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </BrainIllustration>
        <h3>Brain Map Coming Soon!</h3>
        <p>We're working on an interactive brain map visualization that will help you better understand your brainwave activity across different regions.</p>
        
        <FeatureList>
          <li>Spatial distribution of EEG activity</li>
          <li>Color-coded brain regions based on activity levels</li>
          <li>Real-time updates as your brain activity changes</li>
          <li>Ability to focus on specific frequency bands</li>
        </FeatureList>
        
        {!connected && (
          <p style={{ marginTop: "1rem", color: "#ef4444" }}>
            Please connect your Muse headset from the dashboard to activate this feature when available.
          </p>
        )}
      </ComingSoonContainer>
    </Container>
  );
};

export default BrainMap; 