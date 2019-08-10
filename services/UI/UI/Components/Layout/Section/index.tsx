// UI/UI/Components/Layout/Section/index.tsx
import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { useSectionStyles } from './Styles';
import Typography from '@material-ui/core/Typography';

interface Title {
  title: string;
  message?: string;
}

export interface SectionProps {
  className?: string;
  background?: 'primary' | 'secondary';
  title?: Title;
}

export function Section({ ...props }: PropsWithChildren<SectionProps>): React.ReactElement {
  const classes = useSectionStyles(props);
  return (
    <section className={clsx(classes.section, props.className)}>
      {props.title && (
        <>
          <Typography variant='h4' align='center' className={classes.sectionText}>
            {props.title.title}
          </Typography>
          {props.title.message && (
            <Typography variant='body1' align='center' className={classes.sectionText}>
              {props.title.message}
            </Typography>
          )}
        </>
      )}
      {props.children}
    </section>
  );
}
