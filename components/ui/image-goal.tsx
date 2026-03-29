import Image from 'next/image';
import React from 'react';

type Props = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export const ImageGoal = (props: Props) => {
  return (
    <Image
      src={props.url}
      alt={props.alt}
      width={props.width}
      height={props.height}
    />
  );
};
