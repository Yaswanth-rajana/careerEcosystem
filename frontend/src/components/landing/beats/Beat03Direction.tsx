'use client';

import React from 'react';
import { StoryBeatContainer } from './StoryBeatContainer';
import { Beat03CareerRoadmap } from './Beat03CareerRoadmap';

export const Beat03Direction = () => {
  return (
    <StoryBeatContainer
      id="beat-03-direction"
      beatNumber="03"
      eyebrow="THE DIRECTION"
      title="Find your path."
      subtext="A structured 4-step path from your starting point to your career goal."
      className="pt-10 pb-16 lg:pt-12 lg:pb-20"
    >
      <Beat03CareerRoadmap />
    </StoryBeatContainer>
  );
};

