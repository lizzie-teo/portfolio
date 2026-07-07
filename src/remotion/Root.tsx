import React from 'react';
import {Composition} from 'remotion';
import {FundingFinderHero} from './FundingFinderHero';

export const Root: React.FC = () => {
  return (
    <Composition
      id="FundingFinderHero"
      component={FundingFinderHero}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};
